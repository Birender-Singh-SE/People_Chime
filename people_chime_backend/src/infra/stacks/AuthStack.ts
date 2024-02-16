import { CfnOutput, Stack, StackProps } from 'aws-cdk-lib'
import { CfnIdentityPool, CfnIdentityPoolRoleAttachment, UserPoolClientIdentityProvider, CfnUserPoolGroup, ProviderAttribute, UserPoolIdentityProviderGoogle, UserPool, UserPoolClient } from 'aws-cdk-lib/aws-cognito';
import { Effect, FederatedPrincipal, PolicyStatement, Role } from 'aws-cdk-lib/aws-iam';
import { IBucket } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

interface AuthStackProps extends StackProps {
    photosBucket: IBucket
}

//Stack for setting up authentication to the APIs
export class AuthStack extends Stack {

    public userPool: UserPool;
    private userPoolClient: UserPoolClient;
    private identityPool: CfnIdentityPool;
    private authenticatedRole: Role;
    private googleIdentityProvider: UserPoolIdentityProviderGoogle;
    private unAuthenticatedRole: Role;
    private adminRole: Role;

    constructor(scope: Construct, id: string, props?: AuthStackProps) {
        super(scope, id, props);

        this.createUserPool();
        this.createGoogleProvider();
        this.createUserPoolClient();
        this.createUserPoolGroup();
        this.createIdentityPool();
        this.createRoles(props.photosBucket);
        this.attachRoles();
    }

    private createUserPool() {
        //Specifying the name
        this.userPool = new UserPool(this, 'PeopleChimeUserPool', {
            selfSignUpEnabled: true, //Sign up byself
            signInAliases: {
                username: true, //Create user through username
                email: true //Create user through email
            },
            autoVerify: { email: true, phone: true },
        });

        const userPoolDomain = this.userPool.addDomain("default", {
            cognitoDomain: {
                domainPrefix: `peoplechime`,
            },
        });

        new CfnOutput(this, 'PeopleChimeUserPoolId', {
            value: this.userPool.userPoolId //Return the userPool id
        })
    }


    private createGoogleProvider() {
        this.googleIdentityProvider = new UserPoolIdentityProviderGoogle(
            this,
            `MyAuthGoogleIdp`,
            {
                userPool: this.userPool,
                clientId: "814011370079-ip5ml70tvtgfi98aj1qheo738rseuu9n.apps.googleusercontent.com",
                clientSecret: "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",
                scopes: ["email"],
                attributeMapping: {
                    email: ProviderAttribute.GOOGLE_EMAIL,
                }
            });
    }

    // private createUserPoolClient(){
    //     this.userPoolClient = this.userPool.addClient('PeopleChimeUserPoolClient', {
    //         authFlows: {
    //             adminUserPassword: true,
    //             custom: true,
    //             userPassword: true,
    //             userSrp: true
    //         }
    //     });
    //     new CfnOutput(this, 'PeopleChimeUserPoolClientId', {
    //         value: this.userPoolClient.userPoolClientId //Return the userPool client id
    //     })
    // }

    private createUserPoolClient() {
        // const hostedUIClient = new cognito.UserPoolClient(this, `MyHostedUIAppClient`, {
        //     userPool: this.userPool,
        //     supportedIdentityProviders: [
        //       UserPoolClientIdentityProvider.GOOGLE,
        //       UserPoolClientIdentityProvider.COGNITO,
        //     ],
        //     authFlows: {
        //       userPassword: true,
        //     },
        //     generateSecret: false,
        //     oAuth: {
        //       callbackUrls: "<YOUR_CALLBACK_URLS>",
        //     },
        //   });
        this.userPoolClient = this.userPool.addClient('PeopleChimeUserPoolClient', {
            supportedIdentityProviders: [
                UserPoolClientIdentityProvider.GOOGLE,
                UserPoolClientIdentityProvider.COGNITO,
            ],
            authFlows: {
                userPassword: true,
            },
            generateSecret: false,
            oAuth: {
                callbackUrls: ["http://localhost:5173/"],
            },
        });
        new CfnOutput(this, 'PeopleChimeUserPoolClientId', {
            value: this.userPoolClient.userPoolClientId //Return the userPool client id
        })
    }

    private createUserPoolGroup() {
        //create user pool group construct
        new CfnUserPoolGroup(this, 'PeopleChimeAdmins', {
            userPoolId: this.userPool.userPoolId,
            groupName: 'admins'
        })

        //** It appears that with this configuration, all the users in the user pool have the group reviewers - which is not intended */
        new CfnUserPoolGroup(this, 'PeopleChimeReviewers', {
            userPoolId: this.userPool.userPoolId,
            groupName: 'reviewers'
        })
    }

    private createIdentityPool() {
        this.identityPool = new CfnIdentityPool(this, 'PeopleChimeIdentityPool', {
            allowUnauthenticatedIdentities: true,
            cognitoIdentityProviders: [{
                clientId: this.userPoolClient.userPoolClientId,
                providerName: this.userPool.userPoolProviderName
            }]
        })
        new CfnOutput(this, 'PeopleChimeIdentityPoolId', {
            value: this.identityPool.ref
        })
    }

    private createRoles(photosBucket: IBucket) {
        this.authenticatedRole = new Role(this, 'CognitoDefaultAuthenticatedRole', {
            assumedBy: new FederatedPrincipal('cognito-identity.amazonaws.com', {
                StringEquals: {
                    'cognito-identity.amazonaws.com:aud': this.identityPool.ref
                },
                'ForAnyValue:StringLike': {
                    'cognito-identity.amazonaws.com:amr': 'authenticated'
                }
            },
                'sts:AssumeRoleWithWebIdentity'
            )
        });
        this.unAuthenticatedRole = new Role(this, 'CognitoDefaultUnauthenticatedRole', {
            assumedBy: new FederatedPrincipal('cognito-identity.amazonaws.com', {
                StringEquals: {
                    'cognito-identity.amazonaws.com:aud': this.identityPool.ref
                },
                'ForAnyValue:StringLike': {
                    'cognito-identity.amazonaws.com:amr': 'unauthenticated'
                }
            },
                'sts:AssumeRoleWithWebIdentity'
            )
        });
        this.adminRole = new Role(this, 'CognitoAdminRole', {
            assumedBy: new FederatedPrincipal('cognito-identity.amazonaws.com', {
                StringEquals: {
                    'cognito-identity.amazonaws.com:aud': this.identityPool.ref
                },
                'ForAnyValue:StringLike': {
                    'cognito-identity.amazonaws.com:amr': 'authenticated'
                }
            },
                'sts:AssumeRoleWithWebIdentity'
            )
        });

        this.adminRole.addToPolicy(new PolicyStatement({
            effect: Effect.ALLOW,
            actions: [
                's3:PutObject',
                's3:PutObjectAcl'
            ],
            resources: [photosBucket.bucketArn + '/*']//TODO: Update the bucket name from photo to resume.
        }))
    }

    private attachRoles() {
        new CfnIdentityPoolRoleAttachment(this, 'RolesAttachment', {
            identityPoolId: this.identityPool.ref,
            roles: {
                'authenticated': this.adminRole.roleArn,
                'unauthenticated': this.unAuthenticatedRole.roleArn
            },
            roleMappings: {
                adminsMapping: {
                    type: 'Token',
                    ambiguousRoleResolution: 'AuthenticatedRole',
                    identityProvider: `${this.userPool.userPoolProviderName}:${this.userPoolClient.userPoolClientId}`
                }
            }
        })
    }
}
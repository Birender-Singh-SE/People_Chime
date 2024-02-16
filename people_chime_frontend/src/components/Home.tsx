import image from '../assets/landing_page.webp'
import about from '../assets/about.png'
import './Home.css'
import Footer from './Footer';

export default function Home() {
    return (
        <>
            <div className="image">
                <img src={image} alt="People Chime Home Page" />
                <button className='btn' >Submit Your Resume Today</button>
            </div>

            <div className="goal">
                <h1>Our Goal</h1>
                <p>People Chime aims to provide comprehensive support throughout every stage of your career journey.
                    From resume review and revamping to situational counseling, mock-ups, aptitude mentoring, and algo mentoring,
                    our aim is to empower individuals to excel in their professional lives. We strive to offer personalized guidance
                    and realistic simulations to enhance preparedness, sharpen skills, and master key areas crucial for career success.</p>
            </div>
            {/* ------------------------ Initative towards student success ---------------- */}
            <div className='about'>
                <div className="img">
                    <img src={about} alt="about" />
                </div>
                <div className='content'>
                    <h1>An initiative towards the success of students</h1>
                    <p>People Chime takes a proactive approach to support students in their journey towards success by
                        offering a range of services tailored to address their specific needs and challenges. By providing
                        complimentary resume reviews, students receive valuable feedback on their resumes, helping them to
                        present themselves effectively to potential employers and stand out in competitive job markets. Students
                        often face challenging career situations, such as deciding between job offers or navigating workplace conflicts.
                        People Chime  offers expert guidance to help students navigate these situations with confidence and professionalism,
                        empowering them to make informed decisions and progress in their careers.</p>
                    <p>
                        Realistic simulations allow students to experience common workplace scenarios and challenges in a controlled
                        environment. By participating in mock-ups, students can enhance their preparedness for real-world situations,
                        develop problem-solving skills, and build confidence in their abilities.In today's increasingly digital world,
                        proficiency in algorithms and programming is essential for many fields, including technology, finance, and
                        engineering. By providing personalized guidance and support, People Chime helps students master algorithms,
                        setting them up for success in their chosen career paths.
                    </p>
                </div>
            </div>

            {/*  ------------------------- Label -------------------------- */}
            <div className="label">
                <h1>People Chime</h1>
                <h2>Let's Renew Your Carrer Together</h2>
                <button className='button'> <span>Submit Your Resume Today
                </span> </button>
            </div>

            <Footer />
        </>
    );
}
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { APP_NAME, ICONS } from '../constants';
import { api } from '../services/mockApi';
import { Student, Exam, StarPerformerDetails } from '../types';

interface DisplayPerformer {
    student: Student;
    details: StarPerformerDetails;
    examName?: string;
}

const StarPerformerCard = ({ performer }: { performer: DisplayPerformer }) => (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg overflow-hidden transform hover:-translate-y-2 transition-transform duration-300 flex flex-col p-6 h-full">
        <div className="flex-shrink-0 text-center">
            <img
                className="w-32 h-32 rounded-full object-cover border-4 border-indigo-300 dark:border-indigo-600 shadow-md mx-auto"
                src={performer.student.photoUrl}
                alt={performer.student.name}
            />
            <h3 className="mt-4 text-xl font-bold text-gray-900 dark:text-white">{performer.student.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{performer.student.batch} Batch</p>
        </div>
        <div className="mt-4 flex-grow flex flex-col justify-center text-sm text-gray-600 dark:text-gray-300 space-y-3 text-center">
            {performer.examName && (
                <div className="bg-indigo-100 dark:bg-indigo-900/50 rounded-lg p-2">
                    <p className="font-semibold text-indigo-700 dark:text-indigo-300">Achievement In:</p>
                    <p className="text-indigo-600 dark:text-indigo-400 font-medium">{performer.examName}</p>
                </div>
            )}
            {performer.details.remarks && (
                 <p className="italic">"{performer.details.remarks}"</p>
            )}
             {performer.details.description && (
                <p className="text-xs text-gray-500">{performer.details.description}</p>
            )}
        </div>
    </div>
);


const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg text-center transform hover:-translate-y-2 transition-transform duration-300 h-full flex flex-col">
        <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white mx-auto">
            {icon}
        </div>
        <h3 className="mt-5 text-lg font-medium text-gray-900 dark:text-white">{title}</h3>
        <p className="mt-2 text-base text-gray-500 dark:text-gray-400 flex-grow">{description}</p>
    </div>
);

const CourseCard = ({ title, description }: { title: string, description: string }) => (
    <div className="bg-gradient-to-br from-indigo-50 to-blue-100 dark:from-slate-800 dark:to-slate-700 p-6 rounded-lg shadow-md border border-slate-200 dark:border-slate-600">
        <h3 className="text-xl font-bold text-indigo-700 dark:text-indigo-300">{title}</h3>
        <p className="mt-2 text-gray-600 dark:text-gray-400">{description}</p>
    </div>
);

const TestimonialCard = ({ quote, name, achievement }: { quote: string, name: string, achievement: string }) => (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg">
        <p className="text-gray-600 dark:text-gray-400 italic">"{quote}"</p>
        <p className="mt-4 font-bold text-right text-indigo-600 dark:text-indigo-400">- {name}</p>
        <p className="text-sm text-right text-gray-500 dark:text-gray-500">{achievement}</p>
    </div>
);

const LandingPage: React.FC = () => {
    const [starPerformers, setStarPerformers] = useState<DisplayPerformer[]>([]);
    const [loadingPerformers, setLoadingPerformers] = useState(true);

    useEffect(() => {
        const fetchStarPerformers = async () => {
            setLoadingPerformers(true);
            try {
                const [performerDetails, allStudents, allExams] = await Promise.all([
                    api.getStarPerformers(),
                    api.getStudents(),
                    api.getExams(),
                ]);

                if (performerDetails.length === 0) {
                    setStarPerformers([]);
                    setLoadingPerformers(false);
                    return;
                }
                
                const studentMap = new Map(allStudents.map(s => [s.id, s]));
                const examMap = new Map(allExams.map(e => [e.id, e]));
        
                const displayData = performerDetails
                    .map(details => {
                        const student = studentMap.get(details.studentId);
                        if (!student) return null;
                        const examName = details.examId ? examMap.get(details.examId)?.name : undefined;
                        return { student, details, examName };
                    })
                    .filter(Boolean) as DisplayPerformer[];
        
                setStarPerformers(displayData);
        
            } catch(e) {
                console.error("Failed to load star performers", e);
            } finally {
                setLoadingPerformers(false);
            }
        };
    
        fetchStarPerformers();
    }, []);

    const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        const targetId = e.currentTarget.getAttribute('href')?.substring(1);
        if (targetId) {
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    };


  return (
    <div className="bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 min-h-screen">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-md sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{APP_NAME}</h1>
          <nav className="hidden md:flex space-x-8 items-center">
            <a href="#features" onClick={handleNavClick} className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400">Features</a>
            <a href="#courses" onClick={handleNavClick} className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400">Courses</a>
            <a href="#toppers" onClick={handleNavClick} className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400">Our Toppers</a>
            <a href="#testimonials" onClick={handleNavClick} className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400">Success Stories</a>
            <a href="#about" onClick={handleNavClick} className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400">About</a>
            <a href="#contact" onClick={handleNavClick} className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400">Contact</a>
          </nav>
          <Link to="/select-role" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300">
            Portal Login
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main>
        <section className="bg-white dark:bg-slate-800 text-center py-20 px-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMTAiIGN5PSIxMCIgciI6IjEuNSIgZmlsbD0icmdiYSgxMDcsIDExNCwgMTI4LCAwLjA1KSIgLz48L3N2Zz4=')] opacity-50"></div>
          <div className="relative z-1">
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white">Unlock Your Child's Mathematical Potential</h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-400">A complete management system designed for students, parents, and teachers to collaborate for success.</p>
            <div className="mt-8">
                <Link to="/select-role" className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-8 rounded-lg transition-colors duration-300 text-lg shadow-lg transform hover:scale-105">
                    Access Your Dashboard
                </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 px-6">
          <div className="container mx-auto">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Everything You Need in One Place</h2>
              <p className="mt-3 max-w-2xl mx-auto text-lg text-gray-500 dark:text-gray-400">Streamline academic operations, from fee tracking to performance reporting.</p>
            </div>
            <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <FeatureCard 
                icon={ICONS.users} 
                title="Role-Based Dashboards"
                description="Dedicated portals for Admins, Teachers, Students, and Parents with role-specific features."
              />
              <FeatureCard 
                icon={ICONS.fees} 
                title="Fee Management"
                description="Track fee collections, concessions, and view detailed reports with overdue and pending statuses."
              />
              <FeatureCard 
                icon={ICONS.exams} 
                title="Exam & Marks Module"
                description="Manage exam schedules, enter student marks, and automatically generate merit lists."
              />
               <FeatureCard 
                icon={ICONS.reports} 
                title="Comprehensive Reports"
                description="Generate student progress reports, balance statements, and fee collection summaries with one click."
              />
              <FeatureCard 
                icon={ICONS.whatsapp} 
                title="Direct Parent Communication"
                description="Send report cards and important updates directly to the parent's WhatsApp from the app."
              />
               <FeatureCard 
                icon={ICONS.batches} 
                title="Batch Management"
                description="Easily manage year-wise batches, assign students and teachers, and view class schedules."
              />
            </div>
          </div>
        </section>
        
        {/* Courses Section */}
        <section id="courses" className="py-20 px-6 bg-white dark:bg-slate-800">
            <div className="container mx-auto">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Our Courses</h2>
                    <p className="mt-3 max-w-2xl mx-auto text-lg text-gray-500 dark:text-gray-400">Structured programs designed for academic excellence at every level.</p>
                </div>
                <div className="mt-12 grid gap-8 md:grid-cols-2">
                    <CourseCard title="11th Standard (Foundation)" description="Building a strong conceptual foundation for board exams and future competitive tests." />
                    <CourseCard title="12th Standard (Boards & CET/JEE)" description="Comprehensive preparation for HSC board exams alongside MHT-CET and JEE Main." />
                    <CourseCard title="MHT-CET Special Batch" description="A focused program with intensive practice, mock tests, and strategies to crack the MHT-CET." />
                    <CourseCard title="Crash Course" description="A fast-paced revision course covering key topics for last-minute exam preparation." />
                </div>
            </div>
        </section>

        {/* Star Performers Section */}
        {starPerformers.length > 0 && (
            <section id="toppers" className="py-20 px-6">
                <div className="container mx-auto">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Our Star Performers</h2>
                        <p className="mt-3 max-w-2xl mx-auto text-lg text-gray-500 dark:text-gray-400">Celebrating the academic excellence of our top students.</p>
                    </div>
                    <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {loadingPerformers ? (
                             [...Array(3)].map((_, i) => (
                                <div key={i} className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 text-center animate-pulse">
                                    <div className="w-32 h-32 rounded-full bg-gray-300 dark:bg-slate-700 mx-auto"></div>
                                    <div className="h-6 w-3/4 bg-gray-300 dark:bg-slate-700 rounded mt-4 mx-auto"></div>
                                    <div className="h-4 w-1/2 bg-gray-300 dark:bg-slate-700 rounded mt-2 mx-auto"></div>
                                    <div className="h-16 w-3/5 bg-gray-200 dark:bg-slate-700 rounded-full mt-4 mx-auto"></div>
                                </div>
                            ))
                        ) : (
                            starPerformers.map(performer => (
                                <StarPerformerCard key={performer.student.id} performer={performer} />
                            ))
                        )}
                    </div>
                </div>
            </section>
        )}
        
        {/* Testimonials Section */}
        <section id="testimonials" className="py-20 px-6 bg-white dark:bg-slate-800">
            <div className="container mx-auto">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Success Stories</h2>
                    <p className="mt-3 max-w-2xl mx-auto text-lg text-gray-500 dark:text-gray-400">Hear from our students who have achieved their goals with us.</p>
                </div>
                <div className="mt-12 grid gap-8 md:grid-cols-1 lg:grid-cols-2">
                    <TestimonialCard 
                        quote="The personalized attention and doubt-solving sessions at Ghonse Maths Academy were a game-changer for me. I never felt more confident in Mathematics."
                        name="Aarav Mehta"
                        achievement="Scored 99/100 in 12th Boards Maths"
                    />
                    <TestimonialCard 
                        quote="Ghonse Maths Academy provided the perfect strategy and resources for MHT-CET. The regular mock tests helped me manage my time and improve my score drastically."
                        name="Sneha Patil"
                        achievement="99.8 percentile in MHT-CET"
                    />
                </div>
            </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-20 px-6">
            <div className="container mx-auto text-center max-w-3xl">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">About {APP_NAME}</h2>
                <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
                    At {APP_NAME}, we are dedicated to demystifying mathematics and fostering a genuine love for the subject. Our mission is to empower students by building a rock-solid conceptual foundation, not just focusing on rote learning. Led by the experienced Prof. Ghonse, our faculty provides personalized guidance to ensure every student reaches their highest potential. Using this modern platform, we aim to enhance the learning experience by bringing parents, teachers, and students closer together, ensuring transparency and continuous progress.
                </p>
            </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-20 px-6 bg-white dark:bg-slate-800">
            <div className="container mx-auto text-center max-w-3xl">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Get in Touch</h2>
                <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
                    Have questions or want to enroll? Contact us today!
                </p>
                <div className="mt-8 text-left inline-block bg-white dark:bg-slate-800 p-8 rounded-lg shadow-xl">
                    <p className="flex items-center text-lg mb-4"><strong className="w-24">Address:</strong> Rasane Nagar Road, Savedi</p>
                    <p className="flex items-center text-lg mb-4"><strong className="w-24">Phone:</strong> <a href="tel:+919423783250" className="text-indigo-600 hover:underline">+91 94237 83250</a></p>
                    <p className="flex items-center text-lg"><strong className="w-24">Email:</strong> <a href="mailto:ssghonse@gmail.com" className="text-indigo-600 hover:underline">ssghonse@gmail.com</a></p>
                </div>
            </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-800 text-slate-300 py-8">
        <div className="container mx-auto text-center">
          <p>&copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.</p>
          <div className="mt-2 text-sm text-slate-400">
              <p>Rasane Nagar Road, Savedi | +91 94237 83250 | ssghonse@gmail.com</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
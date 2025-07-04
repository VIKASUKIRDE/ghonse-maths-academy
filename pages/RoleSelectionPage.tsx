import React from 'react';
import { Link } from 'react-router-dom';
import { APP_NAME, ICONS } from '../constants';

const RoleCard = ({ icon, title, description, link }: { icon: React.ReactNode, title: string, description: string, link: string }) => (
    <Link to={link} className="block bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-8 rounded-xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transform transition-all duration-300 ease-in-out h-full">
        <div className="flex items-center justify-center h-16 w-16 rounded-full bg-indigo-100 dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 mx-auto">
            {icon}
        </div>
        <h3 className="mt-6 text-2xl font-bold text-center text-gray-900 dark:text-white">{title}</h3>
        <p className="mt-2 text-base text-center text-gray-500 dark:text-gray-400">{description}</p>
    </Link>
);


const RoleSelectionPage: React.FC = () => {
    const roles = [
        {
            icon: ICONS.admin,
            title: 'Admin',
            description: 'For academy administrators to manage the entire system.',
            link: '/login?role=admin'
        },
        {
            icon: ICONS.teacher,
            title: 'Teacher',
            description: 'For teachers to manage batches, exams, and student progress.',
            link: '/login?role=teacher'
        },
        {
            icon: ICONS.student,
            title: 'Student',
            description: 'For students to access report cards, and exam schedules.',
            link: '/login?role=student'
        },
        {
            icon: ICONS.child,
            title: 'Parent',
            description: "For parents to monitor their child's academic activities.",
            link: '/login?role=parent'
        }
    ];

    return (
        <div 
            className="min-h-screen bg-cover bg-center bg-fixed"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1596495578065-45374390e944?q=80&w=2070&auto=format&fit=crop')" }}
        >
            <div className="min-h-screen bg-black/60 dark:bg-black/75 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
                
                <div className="text-center mb-12">
                     <h2 className="text-4xl font-extrabold text-white">
                        Sign In As
                    </h2>
                    <p className="mt-2 text-lg text-gray-200">
                        Please select your role to continue to the {APP_NAME} portal.
                    </p>
                </div>
                
                <div className="max-w-5xl w-full mx-auto grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                    {roles.map(role => (
                        <RoleCard key={role.title} {...role} />
                    ))}
                </div>

                <div className="mt-12 text-center">
                    <Link to="/" className="font-medium text-indigo-300 hover:text-indigo-200 transition-colors">
                        &larr; Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default RoleSelectionPage;
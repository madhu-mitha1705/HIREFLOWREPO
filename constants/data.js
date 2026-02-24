export const SKILLS_LIST = [
    "React Native", "React", "Node.js", "Python", "Java", "Design", "Marketing", "Sales", "Data Analysis"
];

export const MOCK_JOBS = [
    {
        id: "1",
        title: "Junior React Native Developer",
        company: "TechFlow Inc.",
        location: "Remote",
        salary: "$60k - $80k",
        type: "Full-time",
        requiredSkills: ["React Native", "JavaScript", "Redux"],
        description: "We are looking for a passionate mobile developer to join our team.",
        applicants: [],
        postedBy: "recruiter1"
    },
    {
        id: "2",
        title: "UX Designer Intern",
        company: "Creative Studio",
        location: "New York, NY",
        salary: "$20/hr",
        type: "Internship",
        requiredSkills: ["Design", "Figma", "Prototyping"],
        description: "Great opportunity for students to learn from the best.",
        applicants: [],
        postedBy: "recruiter1"
    },
    {
        id: "3",
        title: "Python Backend Engineer",
        company: "DataCorp",
        location: "San Francisco, CA",
        salary: "$120k - $150k",
        type: "Full-time",
        requiredSkills: ["Python", "Django", "SQL"],
        description: "Scale our backend infrastructure.",
        applicants: [],
        postedBy: "recruiter2"
    }
];

export const MOCK_USERS = [
    {
        id: "admin1",
        name: "Admin User",
        role: "admin", // 'admin' | 'candidate' | 'recruiter'
        email: "admin@hireflow.com",
        password: "123"
    },
    {
        id: "candidate1",
        name: "John Student",
        role: "candidate",
        email: "john@student.com",
        password: "123",
        skills: ["React", "JavaScript", "HTML"],
        education: "B.S. Computer Science",
        videoResume: null // Placeholder for video URL
    },
    {
        id: "candidate2",
        name: "Emily Chen",
        role: "candidate",
        email: "emily.chen@email.com",
        password: "123",
        skills: ["React Native", "JavaScript", "Redux"],
        education: "B.S. Software Engineering",
        videoResume: null
    },
    {
        id: "candidate3",
        name: "Michael Johnson",
        role: "candidate",
        email: "michael.j@email.com",
        password: "123",
        skills: ["React Native", "TypeScript", "Firebase"],
        education: "B.Tech Computer Science",
        videoResume: null
    },
    {
        id: "candidate4",
        name: "Sarah Williams",
        role: "candidate",
        email: "sarah.w@email.com",
        password: "123",
        skills: ["Design", "Figma", "UI/UX"],
        education: "B.A. Graphic Design",
        videoResume: null
    },
    {
        id: "candidate5",
        name: "David Brown",
        role: "candidate",
        email: "david.brown@email.com",
        password: "123",
        skills: ["Python", "Django", "SQL"],
        education: "M.S. Computer Science",
        videoResume: null
    },
    {
        id: "candidate6",
        name: "Lisa Anderson",
        role: "candidate",
        email: "lisa.anderson@email.com",
        password: "123",
        skills: ["React", "JavaScript", "Node.js"],
        education: "B.S. Computer Science",
        videoResume: null
    },
    {
        id: "recruiter1",
        name: "Sarah Recruiter",
        role: "recruiter",
        email: "sarah@techflow.com",
        password: "123",
        company: "TechFlow Inc.",
        isVerified: true,
        verificationStatus: "approved"
    },
    {
        id: "recruiter2",
        name: "Mark Wilson",
        role: "recruiter",
        email: "mark@datacorp.com",
        password: "123",
        company: "DataCorp",
        isVerified: true,
        verificationStatus: "approved"
    }
];

export const MOCK_APPLICATIONS = [
    {
        id: "app1",
        jobId: "1",
        candidateId: "candidate2",
        status: "applied",
        score: 85,
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
        id: "app2",
        jobId: "1",
        candidateId: "candidate3",
        status: "shortlisted",
        score: 90,
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
        id: "app3",
        jobId: "1",
        candidateId: "candidate6",
        status: "rejected",
        score: 45,
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
        id: "app4",
        jobId: "2",
        candidateId: "candidate4",
        status: "applied",
        score: 95,
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
        id: "app5",
        jobId: "3",
        candidateId: "candidate5",
        status: "shortlisted",
        score: 88,
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    }
];
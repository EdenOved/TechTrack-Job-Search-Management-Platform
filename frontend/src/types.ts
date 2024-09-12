export interface Company {
    id: string;
    company_name: string;
    location: string;
    industry: string;
    website: string;
    jobs: Job[];  // נוסיף את המשרות כחלק מהחברה

}

export interface Job {
    id: string;
    title: string;
    description: string;
    location: string;
    date_posted: string;
    apply_link: string;
}

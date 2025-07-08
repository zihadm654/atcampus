/* eslint-disable react/no-unescaped-entities */

import Image from 'next/image';
import { redirect } from 'next/navigation';
import React from 'react';
import { CreateJobForm } from '@/components/forms/create-job-post';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import { constructMetadata } from '@/lib/utils';

// const companies = [
//   { id: 0, name: "ArcJet", logo: ArcJetLogo },
//   { id: 1, name: "Inngest", logo: InngestLogo },
//   { id: 2, name: "ArcJet", logo: ArcJetLogo },
//   { id: 3, name: "Inngest", logo: InngestLogo },
//   { id: 4, name: "ArcJet", logo: ArcJetLogo },
//   { id: 5, name: "Inngest", logo: InngestLogo },
// ];

const testimonials = [
  {
    quote:
      'We found our ideal candidate within 48 hours of posting. The quality of applicants was exceptional!',
    author: 'Sarah Chen',
    company: 'TechCorp',
  },
  {
    quote:
      'The platform made hiring remote talent incredibly simple. Highly recommended!',
    author: 'Mark Johnson',
    company: 'StartupX',
  },
  {
    quote:
      "We've consistently found high-quality candidates here. It's our go-to platform for all our hiring needs.",
    author: 'Emily Rodriguez',
    company: 'InnovateNow',
  },
];

const stats = [
  { value: '10k+', label: 'Monthly active job seekers' },
  { value: '48h', label: 'Average time to hire' },
  { value: '95%', label: 'Employer satisfaction rate' },
  { value: '500+', label: 'Companies hiring monthly' },
];

// async function getCompany(userId: string) {
//   const data = await prisma.company.findUnique({
//     where: {
//       userId: userId,
//     },
//     select: {
//       name: true,
//       location: true,
//       about: true,
//       logo: true,
//       xAccount: true,
//       website: true,
//     },
//   });

//   if (!data) {
//     return redirect("/");
//   }
//   return data;
// }
export const metadata = constructMetadata({
  title: 'Create Job - AtCampus',
  description: 'Create Job.',
});
const PostJobPage = async () => {
  const user = await getCurrentUser();
  if (!user) {
    return redirect('/login');
  }
  return (
    <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-3">
      <CreateJobForm />

      <div className="col-span-1">
        <Card className="lg:sticky lg:top-4">
          <CardHeader>
            <CardTitle className="text-xl">
              Trusted by Industry Leaders
            </CardTitle>
            <CardDescription>
              Join thousands of companies hiring top talent
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Company Logos */}
            <div className="grid grid-cols-3 gap-4">
              {/* {companies.map((company) => (
                <div
                  key={company.id}
                  className="flex items-center justify-center"
                >
                  <Image
                    src={company.logo}
                    alt={company.name}
                    height={80}
                    width={80}
                    className="rounded-lg opacity-75 transition-opacity hover:opacity-100"
                  />{" "}
                </div>
              ))} */}
            </div>

            {/* Testimonials */}
            <div className="space-y-4">
              {testimonials.map((testimonial, index) => (
                <blockquote
                  className="border-primary border-l-2 pl-4"
                  key={index}
                >
                  <p className="text-muted-foreground text-sm italic">
                    "{testimonial.quote}"
                  </p>
                  <footer className="mt-2 font-medium text-sm">
                    - {testimonial.author}, {testimonial.company}
                  </footer>
                </blockquote>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              {stats.map((stat, index) => (
                <div className="rounded-lg bg-muted p-4" key={index}>
                  <div className="font-bold text-2xl">{stat.value}</div>
                  <div className="text-muted-foreground text-sm">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PostJobPage;

"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Job from "@/components/jobs/Job";
import { Icons } from "@/components/shared/icons";
import SkillButton from "@/components/skill/SkillButton";
import UserSkillList from "@/components/skill/UserSkillList";

import EditSchoolDialog from "./EditSchoolDialog";
import { getProfessorsForFaculty } from "./schoolActions";
import {
  useDeleteFacultyMutation,
  useDeleteSchoolMutation,
} from "./schoolMutations";
import UserPosts from "./UserPosts";

function ProfessorList({ facultyId }) {
  const { data: professors } = useQuery({
    queryKey: ["professors", facultyId],
    queryFn: () => getProfessorsForFaculty(facultyId),
  });
  return (
    <div>
      <h5>Professors:</h5>
      {professors?.map((p) => <div key={p.id}>{p.name}</div>) ||
        "No professors"}
    </div>
  );
}

export default function ProfileClient({ user, jobs, loggedInUserId }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const deleteSchoolMutation = useDeleteSchoolMutation();
  const deleteFacultyMutation = useDeleteFacultyMutation();

  function handleEditSchool(school) {
    setSelectedSchool(school);
    setIsDialogOpen(true);
  }

  function handleDeleteSchool(schoolId) {
    deleteSchoolMutation.mutate(schoolId);
  }

  function handleDeleteFaculty(facultyId) {
    deleteFacultyMutation.mutate(facultyId);
  }

  return (
    <>
      <EditSchoolDialog
        school={selectedSchool}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
      <div className="bg-card overflow-hidden rounded-2xl shadow-sm">
        <Tabs defaultValue="overview">
          <div className="border-b border-gray-100">
            <TabsList className="flex w-full justify-between p-0">
              <TabsTrigger
                value="overview"
                className="flex-1 rounded-xl border-b-2 border-transparent py-4 transition-all data-[state=active]:border-blue-600 data-[state=active]:text-blue-600"
              >
                <Icons.home className="size-5" />
                <span className="hidden md:block">Overview</span>
              </TabsTrigger>
              <TabsTrigger
                value="posts"
                className="flex-1 rounded-xl border-b-2 border-transparent py-4 transition-all data-[state=active]:border-blue-600 data-[state=active]:text-blue-600"
              >
                <Icons.post className="size-5" />
                <span className="hidden md:block">Posts</span>
              </TabsTrigger>
              <TabsTrigger
                value={user.role === "INSTITUTION" ? "schools" : "courses"}
                className="flex-1 rounded-xl border-b-2 border-transparent py-4 transition-all data-[state=active]:border-blue-600 data-[state=active]:text-blue-600"
              >
                {user.role === "INSTITUTION" ? (
                  <>
                    <Icons.school className="size-5" />
                    <span className="hidden md:block">Schools</span>
                  </>
                ) : (
                  <>
                    <Icons.bookOpen className="size-5" />
                    <span className="hidden md:block">Courses</span>
                  </>
                )}
              </TabsTrigger>
              <TabsTrigger
                value={user.role === "INSTITUTION" ? "clubs" : "jobs"}
                className="flex-1 rounded-xl border-b-2 border-transparent py-4 transition-all data-[state=active]:border-blue-600 data-[state=active]:text-blue-600"
              >
                {user.role === "INSTITUTION" ? (
                  <>
                    <Icons.bookOpen className="size-5" />
                    <span className="hidden md:block">Clubs</span>
                  </>
                ) : (
                  <>
                    <Icons.job className="size-5" />
                    <span className="hidden md:block">Job & Activities</span>
                  </>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="research"
                className="flex-1 rounded-xl border-b-2 border-transparent py-4 transition-all data-[state=active]:border-blue-600 data-[state=active]:text-blue-600"
              >
                <Icons.bookMarked className="size-5" />
                <span className="hidden md:block">Research</span>
              </TabsTrigger>
              {user.role === "INSTITUTION" && (
                <TabsTrigger
                  value="events"
                  className="flex-1 rounded-xl border-b-2 border-transparent py-4 transition-all data-[state=active]:border-blue-600 data-[state=active]:text-blue-600"
                >
                  <Icons.event className="size-5" />
                  <span className="hidden md:block">Events</span>
                </TabsTrigger>
              )}
            </TabsList>
          </div>
          <TabsContent value="overview" className="space-y-2 p-6">
            <div className="grid grid-cols-2 gap-2 max-md:grid-cols-1">
              <Card className="overflow-hidden rounded-xl border border-gray-100 shadow-sm transition-all hover:border-gray-200 hover:shadow">
                <CardHeader className="flex items-center justify-between pb-2">
                  <CardTitle className="flex items-center text-lg font-medium">
                    <Icons.skill className="size-7 pr-2" />
                    Skills
                  </CardTitle>
                  <CardAction>
                    <SkillButton user={user} />
                  </CardAction>
                </CardHeader>
                <CardContent className="pt-1">
                  {user.userSkills.length > 0 ? (
                    <div className="max-h-40 overflow-y-auto">
                      <UserSkillList
                        skills={user.userSkills.map((skill) => ({
                          ...skill,
                          _count: { skillEndorsements: 0 },
                          skill: { category: null },
                        }))}
                        userId={user.id}
                      />
                    </div>
                  ) : (
                    <div className="flex h-28 items-center justify-center rounded-lg text-gray-500">
                      <div className="flex flex-col items-center">
                        <Icons.skill className="size-10" />
                        No skills added yet
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              <Card className="overflow-hidden rounded-xl border border-gray-100 shadow-sm transition-all hover:border-gray-200 hover:shadow">
                <CardHeader className="flex items-center justify-between pb-2">
                  <CardTitle className="flex items-center text-lg font-medium">
                    <Icons.bookOpen className="size-7 pr-2" />
                    Courses
                  </CardTitle>
                  <CardAction>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-full text-green-600 hover:bg-green-50 hover:text-green-800"
                    >
                      <span>See More</span>
                      <Icons.chevronRight className="size-5" />
                    </Button>
                  </CardAction>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="flex h-28 items-center justify-center rounded-lg text-gray-500">
                    <div className="flex flex-col items-center">
                      <Icons.bookOpen className="size-10" />
                      No courses enrolled
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="space-y-2">
              <Card className="overflow-hidden rounded-xl border border-gray-100 shadow-sm transition-all hover:border-gray-200 hover:shadow">
                <CardHeader className="flex items-center justify-between pb-4">
                  <CardTitle className="flex items-center text-lg font-medium">
                    <Icons.job className="mr-2 size-5" />
                    <span>Job & Activities</span>
                  </CardTitle>
                  <CardAction>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-full text-amber-600 hover:bg-amber-50 hover:text-amber-800"
                    >
                      <span>See More</span>
                      <Icons.chevronRight className="size-5" />
                    </Button>
                  </CardAction>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-2 max-md:grid-cols-1">
                  {jobs.length > 0 ? (
                    jobs
                      .filter((item) => item.job)
                      .map((item) => <Job key={item.job.id} job={item.job} />)
                  ) : (
                    <div className="flex flex-col items-center justify-center w-full">
                      <Icons.job className="size-10" />
                      <p>No job or activities added yet</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-4 rounded-full"
                      >
                        <Icons.add className="size-4" />
                        Add Experience
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
              <Card className="overflow-hidden rounded-xl border border-gray-100 shadow-sm transition-all hover:border-gray-200 hover:shadow">
                <CardHeader className="flex items-center justify-between pb-4">
                  <CardTitle className="flex items-center text-lg font-medium">
                    <Star className="size-7 pr-2" />
                    Achievements
                  </CardTitle>
                  <CardAction>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-full text-amber-600 hover:bg-amber-50 hover:text-amber-800"
                    >
                      <span>See More</span>
                      <Icons.chevronRight className="size-5" />
                    </Button>
                  </CardAction>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="flex h-28 items-center justify-center rounded-lg text-gray-500">
                    <div className="flex flex-col items-center">
                      <Star className="size-10" />
                      No achievements yet
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="posts" className="mx-auto max-w-2xl p-6">
            <h2 className="mb-6 flex items-center text-xl font-medium">
              <Icons.post className="size-5" />
              {user.name}&apos;s posts
            </h2>
            <UserPosts userId={user.id} />
          </TabsContent>
          <TabsContent value="jobs" className="p-4">
            <div className="grid grid-cols-1 gap-3">
              <Card className="overflow-hidden rounded-xl border border-gray-100 shadow-sm transition-all hover:border-gray-200 hover:shadow">
                <CardHeader className="flex items-center justify-between pb-4">
                  <CardTitle className="flex items-center text-lg font-medium">
                    <Icons.job className="mr-3 size-5" />
                    <span>Job & Activities</span>
                  </CardTitle>
                  <CardAction>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-full text-amber-600 hover:bg-amber-50 hover:text-amber-800"
                    >
                      <span>See More</span>
                      <Icons.chevronRight className="size-5" />
                    </Button>
                  </CardAction>
                </CardHeader>
                <CardContent className="grid grid-cols-3 gap-2 max-md:grid-cols-1">
                  {jobs.length > 0 ? (
                    jobs
                      .filter((item) => item.job)
                      .map((item) => <Job key={item.job.id} job={item.job} />)
                  ) : (
                    <div className="flex flex-col items-center">
                      <Icons.job className="size-10" />
                      <p>No job or activities added yet</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-4 rounded-full"
                      >
                        <Icons.add className="size-4" />
                        Add Experience
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="schools" className="p-4">
            <div className="grid grid-cols-1 gap-3">
              <Card className="overflow-hidden rounded-xl border border-gray-100 shadow-sm transition-all hover:border-gray-200 hover:shadow">
                <CardHeader className="flex items-center justify-between pb-4">
                  <CardTitle className="flex items-center text-lg font-medium">
                    <Icons.school className="mr-3 size-5" />
                    <span>Schools & Faculties</span>
                  </CardTitle>
                  <CardAction>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-full text-amber-600 hover:bg-amber-50 hover:text-amber-800"
                      onClick={() => {
                        setSelectedSchool(null);
                        setIsDialogOpen(true);
                      }}
                    >
                      <Icons.add className="size-4" />
                      Add School
                    </Button>
                  </CardAction>
                </CardHeader>
                <CardContent className="grid grid-cols-3 gap-2 max-md:grid-cols-1">
                  {user.schools.map((school) => (
                    <div key={school.id} className="rounded-lg border p-4">
                      <div className="flex justify-between">
                        <h3 className="font-medium">{school.name}</h3>
                        <div>
                          <Button
                            variant="ghost"
                            onClick={() => handleEditSchool(school)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            onClick={() => handleDeleteSchool(school.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">
                        {school.description}
                      </p>
                      <div className="mt-2">
                        <h4 className="text-sm font-medium">Faculties:</h4>
                        {school.faculties.map((faculty) => (
                          <div
                            key={faculty.id}
                            className="ml-4 mt-2 text-sm text-gray-600"
                          >
                            <div className="flex justify-between">
                              <span>{faculty.name}</span>
                              <div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    /* TODO: handle edit faculty */
                                  }}
                                >
                                  Edit
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleDeleteFaculty(faculty.id)
                                  }
                                >
                                  Delete
                                </Button>
                              </div>
                            </div>
                            <p>{faculty.description}</p>
                            <ProfessorList facultyId={faculty.id} />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="research" className="p-4">
            <div className="grid grid-cols-1 gap-3">
              <Card className="overflow-hidden rounded-xl border border-gray-100 shadow-sm transition-all hover:border-gray-200 hover:shadow">
                <CardHeader className="flex items-center justify-between pb-4">
                  <CardTitle className="flex items-center text-lg font-medium">
                    <Icons.bookMarked className="mr-3 size-5" />
                    <span>Research</span>
                  </CardTitle>
                  <CardAction>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-full text-amber-600 hover:bg-amber-50 hover:text-amber-800"
                    >
                      <span>See More</span>
                      <Icons.chevronRight className="size-5" />
                    </Button>
                  </CardAction>
                </CardHeader>
                <CardContent className="grid grid-cols-3 gap-2 max-md:grid-cols-1">
                  {jobs.length > 0 ? (
                    jobs
                      .filter((item) => item.job)
                      .map((item) => <Job key={item.job.id} job={item.job} />)
                  ) : (
                    <div className="flex flex-col items-center">
                      <Icons.job className="size-10" />
                      <p>No research or activities added yet</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-4 rounded-full"
                      >
                        <Icons.add className="size-4" />
                        Add Experience
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          {/* TODO: Add content for clubs, courses, events if needed */}
        </Tabs>
      </div>
    </>
  );
}

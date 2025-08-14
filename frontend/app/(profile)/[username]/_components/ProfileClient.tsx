"use client";

import { Fragment, useState } from "react";
import Image from "next/image";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import JobComponent from "@/components/jobs/Job";
import ResearchComponent from "@/components/researches/Research";
import { Icons } from "@/components/shared/icons";
import SkillButton from "@/components/skill/SkillButton";
import UserSkillList from "@/components/skill/UserSkillList";

import AssignFacultyDialog from "./AssignFacultyDialog";
import EditSchoolDialog from "./EditSchoolDialog";
import FacultyList from "./FacultyList";
import { getProfessorsForFaculty, updateFaculty } from "./schoolActions";
import ProfessorList from "./ProfessorList";
import {
  useDeleteFacultyMutation,
  useDeleteSchoolMutation,
} from "./schoolMutations";
import UserPosts from "./UserPosts";
import {
  Member,
  Job,
  Research,
  User,
  Faculty,
  ProfessorProfile,
  School,
} from "@prisma/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";

// interface Props {
//   user: User & {
//     userSkills: {
//       skill: {
//         category: {
//           name: string;
//         };
//       };
//     }[];
//     members: Member[];
//     schools: (School & { faculties: Faculty[] })[];
//     professorProfile: ProfessorProfile | null;
//     institution?: {
//       members: (Member & { user: User })[];
//     }[];
//   };
//   jobs: Job[];
//   researches: Research[];
//   loggedInUserId: string;
// }
export default function ProfileClient({
  user,
  jobs,
  researches,
  // courses,
  loggedInUserId,
}: any) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [isAssignFacultyDialogOpen, setIsAssignFacultyDialogOpen] =
    useState(false);
  const [selectedMemberForFaculty, setSelectedMemberForFaculty] =
    useState<Member | null>(null);

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

  function handleAssignFaculty(member: Member) {
    setSelectedMemberForFaculty(member);
    setIsAssignFacultyDialogOpen(true);
  }
  const router = useRouter();

  return (
    <Fragment>
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
                  <Fragment>
                    <Icons.users className="size-5" />{" "}
                    <span className="hidden md:block">Clubs</span>
                  </Fragment>
                ) : (
                  <Fragment>
                    <Icons.job className="size-5" />{" "}
                    <span className="hidden md:block">Job & Activities</span>
                  </Fragment>
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
              {user.role === "ORGANIZATION" && (
                <TabsTrigger
                  value="members"
                  className="flex-1 rounded-xl border-b-2 border-transparent py-4 transition-all data-[state=active]:border-blue-600 data-[state=active]:text-blue-600"
                >
                  <Icons.users className="size-5" />
                  <span className="hidden md:block">Members</span>
                </TabsTrigger>
              )}
            </TabsList>
          </div>

          <AssignFacultyDialog
            open={isAssignFacultyDialogOpen}
            onOpenChange={setIsAssignFacultyDialogOpen}
            member={selectedMemberForFaculty}
            faculties={user.schools.flatMap((school) => school.faculties)}
          />

          <TabsContent value="overview" className="space-y-2 p-3">
            {user.role === "STUDENT" ||
            user.role === "PROFESSOR" ||
            user.role === "ADMIN" ? (
              <Fragment>
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
                    <CardContent className="pt-1">
                      {/* {courses.length > 0 ? (
                        <div className="max-h-40 overflow-y-auto">
                          <ul className="space-y-2">
                            {courses.map((enrollment) => (
                              <li key={enrollment.id} className="border p-2 rounded-md">
                                {enrollment.course.title} ({enrollment.course.code})
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : (
                        <div className="flex h-28 items-center justify-center rounded-lg text-gray-500">
                          <div className="flex flex-col items-center">
                            <Icons.bookOpen className="size-10" />
                            No courses enrolled
                          </div>
                        </div>
                      )} */}
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
                        jobs.map((item) => (
                          <JobComponent key={item.job.id} job={item.job} />
                        ))
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
              </Fragment>
            ) : user.role === "INSTITUTION" ? (
              <Fragment>
                <div className="grid grid-cols-2 gap-2 max-md:grid-cols-1">
                  <Card className="overflow-hidden rounded-xl border border-gray-100 shadow-sm transition-all hover:border-gray-200 hover:shadow">
                    <CardHeader className="flex items-center justify-between pb-2">
                      <CardTitle className="flex items-center text-lg font-medium">
                        <Icons.users className="size-7 pr-2" />
                        Members
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-1">
                      {user.members?.length > 0 ? (
                        <div className="max-h-40 overflow-y-auto">
                          <ul className="space-y-2">
                            {user.members.map((member) => (
                              <li
                                key={member.id}
                                className="flex items-center justify-between border p-2 rounded-md"
                              >
                                <div className="flex items-center space-x-2">
                                  {/* <Avatar className="size-8">
                                    <AvatarImage
                                      src={member.user.image || undefined}
                                    />
                                    <AvatarFallback>
                                      {member.user.name
                                        ? member.user.name[0]
                                        : "?"}
                                    </AvatarFallback>
                                  </Avatar> */}
                                  <span> - {member.role}</span>
                                </div>
                                {member.role === "owner" && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedMemberForFaculty(member);
                                      setIsAssignFacultyDialogOpen(true);
                                    }}
                                  >
                                    Assign to Faculty
                                  </Button>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : (
                        <div className="flex h-28 items-center justify-center rounded-lg text-gray-500">
                          <div className="flex flex-col items-center">
                            <Icons.users className="size-10" />
                            No members found
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </Fragment>
            ) : (
              <h1>you are {user.role}</h1>
            )}
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
                    jobs.map((item) => (
                      <JobComponent key={item.job.id} job={item.job} />
                    ))
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
          <TabsContent value="schools" className="p-3 max-md:p-1.5">
            <div className="grid grid-cols-1 gap-3">
              <Card className="overflow-hidden rounded-xl border border-gray-100 shadow-sm transition-all hover:border-gray-200 hover:shadow">
                <CardHeader className="flex items-center justify-between pb-2">
                  <CardTitle className="flex items-center text-lg font-medium">
                    <Icons.school className="mr-3 size-5" />
                    <h1 className="text-xl">Schools</h1>
                  </CardTitle>
                  {user.role === "INSTITUTION" &&
                    loggedInUserId === user.id && (
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
                          Add
                          <Icons.add className="size-4" />
                        </Button>
                      </CardAction>
                    )}
                </CardHeader>
                <CardContent className="grid gap-2 grid-cols-1 max-md:px-3">
                  {user.schools.map((school) => (
                    <div
                      key={school.id}
                      className="rounded-lg border p-3 max-md:p-2"
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center justify-start space-x-2">
                          <img
                            src={"_static/avatars/shadcn.jpeg"}
                            alt={school.name}
                            className="size-10 rounded-full"
                            // height={20}
                            // width={20}
                          />
                          <div className="pl-4">
                            <h2 className="font-medium text-2xl">
                              {school.name}
                            </h2>
                            <p className="text-md text-gray-400">
                              {school.description}
                            </p>
                            <Button
                              type="button"
                              className="mt-3 cursor-pointer"
                              onClick={() =>
                                router.push(`/${user.username}/${school.id}`)
                              }
                            >
                              View More
                            </Button>
                          </div>
                        </div>
                        {user.role === "INSTITUTION" &&
                          loggedInUserId === user.id && (
                            <div className="m-2">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
                                  >
                                    <DotsHorizontalIcon className="size-5" />
                                    <span className="sr-only">Open menu</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                  align="end"
                                  className="w-[160px]"
                                >
                                  <DropdownMenuItem
                                    onClick={() => handleEditSchool(school)}
                                  >
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleDeleteSchool(school.id)
                                    }
                                  >
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          )}
                      </div>
                      {/* <div className="mt-2">
                        <h4 className="font-medium text-gray-400">
                          Faculties:
                        </h4>
                        <div className="grid grid-cols-2 max-md:grid-cols-1 gap-2 w-full">
                          {school.faculties.map((faculty) => (
                            <div
                              key={faculty.id}
                              className="mt-2 text-md border rounded-lg p-2"
                            >
                              <div className="flex items-center justify-between">
                                <h4 className="text-lg">{faculty.name}</h4>
                                {user.role === "INSTITUTION" &&
                                  loggedInUserId === user.id && (
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
                                        >
                                          <DotsHorizontalIcon className="size-5" />
                                          <span className="sr-only">
                                            Open menu
                                          </span>
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent
                                        align="end"
                                        className="w-[160px]"
                                      >
                                        <DropdownMenuItem>
                                          Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                          onClick={() =>
                                            handleDeleteFaculty(faculty.id)
                                          }
                                        >
                                          Delete
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  )}
                              </div>
                              <p className="text-gray-400">
                                {faculty.description}
                              </p>
                              <ProfessorList facultyId={faculty.id} />
                            </div>
                          ))}
                        </div>
                      </div> */}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
            {user.professorProfile ? (
              <FacultyList
                faculties={user.schools.flatMap((school) => school.faculties)}
              />
            ) : null}
          </TabsContent>
          <TabsContent value="courses" className="p-3"></TabsContent>
          <TabsContent value="research" className="p-3">
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
                  {researches.length > 0 && user.id === loggedInUserId ? (
                    researches.map((item) => (
                      <ResearchComponent key={item.id} research={item} />
                    ))
                  ) : (
                    <div className="flex flex-col items-center">
                      <Icons.bookMarked className="size-10" />
                      <p>No research added yet</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-4 rounded-full"
                      >
                        <Icons.add className="size-4" />
                        Add research
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="clubs">
            <section className="p-3">
              <div className="flex items-center justify-between">
                <h1 className="text-xl">Clubs</h1>
                <Button>Create Club</Button>
              </div>
              <div className="grid grid-cols-2 gap-3 p-2">
                {user.clubs.length > 0 ? (
                  user.clubs.map((club) => (
                    <Card key={club.id}>
                      <CardHeader>
                        <CardTitle>{club.title}</CardTitle>
                        <CardAction></CardAction>
                      </CardHeader>
                      <CardContent></CardContent>
                    </Card>
                  ))
                ) : (
                  <p>there are no club yet</p>
                )}
              </div>
            </section>
          </TabsContent>
          <TabsContent value="events">
            <section className="p-3">
              <div className="flex items-center justify-between">
                <h1 className="text-xl">Events</h1>
                <Button>Create Event</Button>
              </div>
              <div className="grid grid-cols-2 gap-3 p-2">
                {user.events.length > 0 ? (
                  user.events.map((event) => (
                    <Card key={event.id}>
                      <CardHeader>
                        <CardTitle>{event.title}</CardTitle>
                        <CardAction></CardAction>
                      </CardHeader>
                      <CardContent></CardContent>
                    </Card>
                  ))
                ) : (
                  <p>there are no event yet</p>
                )}
              </div>
            </section>
          </TabsContent>
          {/* TODO: Add content for clubs, courses, events if needed */}
        </Tabs>
      </div>
    </Fragment>
  );
}

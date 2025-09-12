"use client";

import { Fragment, useState } from "react";
import Image from "next/image";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { useQuery } from "@tanstack/react-query";
import { Star, Building2, GraduationCap, BookOpen, Users2, MapPin, ChevronDown, BarChart3, Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import { formatDate } from "date-fns";
import {
  Member,
  Job,
  Research,
  User,
  Faculty,
  School,
  Organization,
  Application,
  Enrollment,
  Course,
  UserRole,
} from "@prisma/client";

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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import JobComponent from "@/components/jobs/Job";
import ResearchComponent from "@/components/researches/Research";
import { Icons } from "@/components/shared/icons";
import SkillButton from "@/components/skill/SkillButton";
import UserSkillList from "@/components/skill/UserSkillList";

import AssignFacultyDialog from "./AssignFacultyDialog";
import EditSchoolDialog from "./EditSchoolDialog";
import FacultyList from "./FacultyList";
import ProfessorList from "./ProfessorList";
import UserPosts from "./UserPosts";
import {
  useDeleteFacultyMutation,
  useDeleteSchoolMutation,
} from "./schoolMutations";

// Enhanced types for profile data with proper schema relationships
type ExtendedSchool = School & {
  faculties: Array<Faculty & {
    courses: Array<Course & {
      instructor: User;
      enrollments: Enrollment[];
      _count: { enrollments: number };
    }>;
    _count: { courses: number; members: number };
  }>;
  _count: { faculties: number };
};

type ExtendedOrganization = Organization & {
  schools: ExtendedSchool[];
  members: Array<Member & {
    user: User;
    faculty?: Faculty;
  }>;
  _count: { schools: number; members: number };
};

type ProfileUser = User & {
  _count: {
    posts: number;
    followers: number;
    following: number;
  };
  members: Array<Member & {
    organization: Organization;
    faculty: Faculty | null;
  }>;
  userSkills: Array<{
    id: string;
    title: string;
    level: string;
    yearsOfExperience: number;
    skill: {
      name: string;
      category: string | null;
    };
    _count: {
      endorsements: number;
    };
  }>;
  clubs: Array<{ id: string; name: string; description: string }>;
  events: Array<{ id: string; name: string; description: string }>;
};

type JobApplication = Application & {
  job: Job & {
    user: User;
    savedJobs: Array<{ userId: string }>;
    applications: Array<{ applicantId: string }>;
    _count: {
      applications: number;
    };
  };
};

type CourseEnrollment = Enrollment & {
  course: {
    id: string;
    code: string;
    title: string;
    description: string;
    credits: number | null;
    status: string;
    startDate: Date | null;
    endDate: Date | null;
    instructor: {
      id: string;
      name: string;
      image: string | null;
      username: string | null;
    };
    faculty: {
      id: string;
      name: string;
      slug: string;
    };
  };
};

interface Props {
  user: any;
  jobs: any[];
  researches: Research[];
  courses: any[];
  loggedInUserId: string;
  // Additional props for institution data
  organizationData?: ExtendedOrganization[];
}

// Helper function to get role-based tabs
const getRoleBasedTabs = (role: UserRole) => {
  const baseTabs = [
    { value: "overview", label: "Overview", icon: Icons.home },
    { value: "posts", label: "Posts", icon: Icons.post },
  ];

  switch (role) {
    case "INSTITUTION":
      return [
        ...baseTabs,
        { value: "schools", label: "Schools", icon: Building2 },
        { value: "analytics", label: "Analytics", icon: Icons.chart },
        { value: "settings", label: "Settings", icon: Icons.settings },
      ];
    case "ORGANIZATION":
      return [
        ...baseTabs,
        { value: "members", label: "Members", icon: Users2 },
        { value: "departments", label: "Departments", icon: Building2 },
      ];
    case "PROFESSOR":
      return [
        ...baseTabs,
        { value: "courses", label: "Courses", icon: BookOpen },
        { value: "research", label: "Research", icon: Icons.bookMarked },
        { value: "students", label: "Students", icon: GraduationCap },
      ];
    case "STUDENT":
      return [
        ...baseTabs,
        { value: "courses", label: "Courses", icon: BookOpen },
        { value: "jobs", label: "Jobs & Activities", icon: Icons.job },
        { value: "research", label: "Research", icon: Icons.bookMarked },
      ];
    default:
      return [
        ...baseTabs,
        { value: "courses", label: "Courses", icon: BookOpen },
        { value: "jobs", label: "Jobs", icon: Icons.job },
        { value: "research", label: "Research", icon: Icons.bookMarked },
      ];
  }
};
// Institution-specific tab content components
function InstitutionSchoolsContent({
  organizationData,
  user,
  expandedSchools,
  expandedFaculties,
  toggleSchool,
  toggleFaculty,
  onEditSchool,
  onDeleteSchool,
  onDeleteFaculty
}: {
  organizationData: ExtendedOrganization[];
  user: ProfileUser;
  expandedSchools: Set<string>;
  expandedFaculties: Set<string>;
  toggleSchool: (schoolId: string) => void;
  toggleFaculty: (facultyId: string) => void;
  onEditSchool: (school: any) => void;
  onDeleteSchool: (schoolId: string) => void;
  onDeleteFaculty: (facultyId: string) => void;
}) {
  const organization = organizationData[0]; // Institution should have one organization

  if (!organization?.schools?.length) {
    return (
      <Card className="overflow-hidden rounded-xl border border-gray-100 shadow-sm">
        <CardContent className="flex flex-col items-center py-12">
          <Building2 className="size-16 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-700 mt-4">No Schools Found</h3>
          <p className="text-gray-500 mt-2 text-center max-w-md">
            This institution doesn't have any schools yet. Schools help organize faculties and courses.
          </p>
          <Button className="mt-6" variant="outline">
            <Icons.add className="size-4 mr-2" />
            Add First School
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Building2 className="size-6" />
          Schools & Academic Structure
        </h2>
        <Badge variant="secondary" className="px-3 py-1">
          {organization.schools.length} School{organization.schools.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      <div className="grid gap-4">
        {organization.schools.map((school) => (
          <Card key={school.id} className="overflow-hidden rounded-xl border border-gray-100 shadow-sm transition-all hover:border-gray-200 hover:shadow">
            <Collapsible
              open={expandedSchools.has(school.id)}
              onOpenChange={() => toggleSchool(school.id)}
            >
              <CollapsibleTrigger className="w-full">
                <CardHeader className="flex flex-row items-center justify-between py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                      {school.name.charAt(0)}
                    </div>
                    <div className="text-left">
                      <CardTitle className="text-lg font-semibold">{school.name}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">
                        {school.description || 'No description available'}
                      </p>
                      <div className="flex items-center gap-4 mt-2">
                        <Badge variant="outline" className="text-xs">
                          <GraduationCap className="size-3 mr-1" />
                          {school.faculties?.length || 0} Faculties
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          <BookOpen className="size-3 mr-1" />
                          {school.faculties?.reduce((total, faculty) => total + (faculty.courses?.length || 0), 0) || 0} Courses
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <DotsHorizontalIcon className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEditSchool(school); }}>
                          <Icons.pencil className="size-4 mr-2" />
                          Edit School
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => { e.stopPropagation(); onDeleteSchool(school.id); }}
                          className="text-red-600"
                        >
                          <Icons.trash className="size-4 mr-2" />
                          Delete School
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Icons.chevronDown className={`size-5 transition-transform ${expandedSchools.has(school.id) ? 'rotate-180' : ''
                      }`} />
                  </div>
                </CardHeader>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <CardContent className="pt-0">
                  {school.faculties?.length > 0 ? (
                    <div className="space-y-3 pl-4 border-l-2 border-gray-100">
                      {school.faculties.map((faculty) => (
                        <Card key={faculty.id} className="border border-gray-200 rounded-lg">
                          <Collapsible
                            open={expandedFaculties.has(faculty.id)}
                            onOpenChange={() => toggleFaculty(faculty.id)}
                          >
                            <CollapsibleTrigger className="w-full">
                              <div className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-500 rounded-md flex items-center justify-center text-white font-semibold text-sm">
                                    {faculty.name.charAt(0)}
                                  </div>
                                  <div className="text-left">
                                    <h4 className="font-medium">{faculty.name}</h4>
                                    <p className="text-sm text-gray-600">
                                      {faculty.description || 'No description available'}
                                    </p>
                                    <div className="flex items-center gap-3 mt-1">
                                      <Badge variant="secondary" className="text-xs">
                                        <BookOpen className="size-3 mr-1" />
                                        {faculty.courses?.length || 0} Courses
                                      </Badge>
                                      <Badge variant="secondary" className="text-xs">
                                        <Users2 className="size-3 mr-1" />
                                        {faculty._count?.members || 0} Members
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                        <DotsHorizontalIcon className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                                        <Icons.pencil className="size-4 mr-2" />
                                        Edit Faculty
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={(e) => { e.stopPropagation(); onDeleteFaculty(faculty.id); }}
                                        className="text-red-600"
                                      >
                                        <Icons.trash className="size-4 mr-2" />
                                        Delete Faculty
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                  <Icons.chevronDown className={`size-4 transition-transform ${expandedFaculties.has(faculty.id) ? 'rotate-180' : ''
                                    }`} />
                                </div>
                              </div>
                            </CollapsibleTrigger>

                            <CollapsibleContent>
                              <div className="px-4 pb-4">
                                {faculty.courses?.length > 0 ? (
                                  <div className="space-y-2 pl-4 border-l border-gray-200">
                                    <h5 className="text-sm font-medium text-gray-700 mb-2">Courses</h5>
                                    {faculty.courses.map((course) => (
                                      <div key={course.id} className="bg-gray-50 rounded-lg p-3 border">
                                        <div className="flex items-start justify-between">
                                          <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                              <h6 className="font-medium text-sm">{course.title}</h6>
                                              <Badge variant="outline" className="text-xs">
                                                {course.code}
                                              </Badge>
                                            </div>
                                            <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                              {course.description}
                                            </p>
                                            <div className="flex items-center gap-4 mt-2">
                                              <span className="text-xs text-gray-500">
                                                <Users2 className="size-3 inline mr-1" />
                                                Instructor: {course.instructor.name}
                                              </span>
                                              <span className="text-xs text-gray-500">
                                                <GraduationCap className="size-3 inline mr-1" />
                                                {course._count?.enrollments || 0} Students
                                              </span>
                                              <span className="text-xs text-gray-500">
                                                {course.credits || 3} Credits
                                              </span>
                                            </div>
                                            <div className="flex items-center gap-2 mt-2">
                                              <Badge
                                                variant={course.status === 'ACTIVE' ? 'default' : 'secondary'}
                                                className="text-xs"
                                              >
                                                {course.status.toLowerCase()}
                                              </Badge>
                                              {course.startDate && (
                                                <span className="text-xs text-gray-500">
                                                  <MapPin className="size-3 inline mr-1" />
                                                  {formatDate(new Date(course.startDate), 'MMM yyyy')}
                                                </span>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="text-center py-6 text-gray-500">
                                    <BookOpen className="size-8 mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">No courses in this faculty yet</p>
                                  </div>
                                )}
                              </div>
                            </CollapsibleContent>
                          </Collapsible>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <GraduationCap className="size-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">No faculties in this school yet</p>
                      <Button variant="outline" size="sm" className="mt-3">
                        <Icons.add className="size-4 mr-2" />
                        Add Faculty
                      </Button>
                    </div>
                  )}
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        ))}
      </div>
    </div>
  );
}

function InstitutionAnalyticsContent({ organizationData }: { organizationData: ExtendedOrganization[] }) {
  const organization = organizationData[0];

  const totalSchools = organization?.schools?.length || 0;
  const totalFaculties = organization?.schools?.reduce((sum, school) => sum + (school.faculties?.length || 0), 0) || 0;
  const totalCourses = organization?.schools?.reduce((sum, school) =>
    sum + (school.faculties?.reduce((fSum, faculty) => fSum + (faculty.courses?.length || 0), 0) || 0), 0) || 0;
  const totalMembers = organization?._count?.members || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Icons.chart className="size-6" />
        <h2 className="text-2xl font-bold">Institution Analytics</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Building2 className="size-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Schools</p>
              <p className="text-2xl font-bold">{totalSchools}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <GraduationCap className="size-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Faculties</p>
              <p className="text-2xl font-bold">{totalFaculties}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <BookOpen className="size-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Courses</p>
              <p className="text-2xl font-bold">{totalCourses}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Users2 className="size-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Members</p>
              <p className="text-2xl font-bold">{totalMembers}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Academic Structure Overview</h3>
        <div className="space-y-4">
          {organization?.schools?.map((school) => (
            <div key={school.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">{school.name}</h4>
                <div className="flex gap-4 text-sm text-gray-600">
                  <span>{school.faculties?.length || 0} Faculties</span>
                  <span>
                    {school.faculties?.reduce((sum, f) => sum + (f.courses?.length || 0), 0) || 0} Courses
                  </span>
                </div>
              </div>
            </div>
          )) || (
              <div className="text-center py-8 text-gray-500">
                <Icons.chart className="size-12 mx-auto mb-3 opacity-50" />
                <p>No data available for analytics</p>
              </div>
            )}
        </div>
      </Card>
    </div>
  );
}

function InstitutionSettingsContent({ user }: { user: ProfileUser }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Icons.settings className="size-6" />
        <h2 className="text-2xl font-bold">Institution Settings</h2>
      </div>

      <div className="grid gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">General Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Institution Name</label>
              <p className="text-gray-900 mt-1">{user.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Username</label>
              <p className="text-gray-900 mt-1">@{user.username}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Email</label>
              <p className="text-gray-900 mt-1">{user.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Bio</label>
              <p className="text-gray-900 mt-1">{user.bio || 'No bio available'}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Academic Year Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Current Academic Year</p>
                <p className="text-sm text-gray-600">Set the current academic year for course scheduling</p>
              </div>
              <Button variant="outline">Configure</Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Semester System</p>
                <p className="text-sm text-gray-600">Configure semester or quarter system</p>
              </div>
              <Button variant="outline">Configure</Button>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Course Management</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Course Approval Workflow</p>
                <p className="text-sm text-gray-600">Configure approval levels for new courses</p>
              </div>
              <Button variant="outline">Configure</Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Enrollment Settings</p>
                <p className="text-sm text-gray-600">Set enrollment periods and limits</p>
              </div>
              <Button variant="outline">Configure</Button>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">System Permissions</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">User Roles & Permissions</p>
                <p className="text-sm text-gray-600">Manage roles and their permissions</p>
              </div>
              <Button variant="outline">Manage</Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Faculty Management</p>
                <p className="text-sm text-gray-600">Configure faculty creation and management</p>
              </div>
              <Button variant="outline">Configure</Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function ProfileClient({
  user,
  jobs,
  researches,
  courses,
  loggedInUserId,
  organizationData = [],
}: Props) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [isAssignFacultyDialogOpen, setIsAssignFacultyDialogOpen] = useState(false);
  const [selectedMemberForFaculty, setSelectedMemberForFaculty] = useState<Member | null>(null);
  const [expandedSchools, setExpandedSchools] = useState<Set<string>>(new Set());
  const [expandedFaculties, setExpandedFaculties] = useState<Set<string>>(new Set());

  const router = useRouter();
  const deleteSchoolMutation = useDeleteSchoolMutation();
  const deleteFacultyMutation = useDeleteFacultyMutation();

  // Get role-based tabs
  const roleTabs = getRoleBasedTabs(user.role as UserRole);

  // Toggle functions for collapsible content
  const toggleSchool = (schoolId: string) => {
    const newExpanded = new Set(expandedSchools);
    if (newExpanded.has(schoolId)) {
      newExpanded.delete(schoolId);
    } else {
      newExpanded.add(schoolId);
    }
    setExpandedSchools(newExpanded);
  };

  const toggleFaculty = (facultyId: string) => {
    const newExpanded = new Set(expandedFaculties);
    if (newExpanded.has(facultyId)) {
      newExpanded.delete(facultyId);
    } else {
      newExpanded.add(facultyId);
    }
    setExpandedFaculties(newExpanded);
  };

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

  return (
    <Fragment>
      <EditSchoolDialog
        school={selectedSchool}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
      <div className="bg-card overflow-hidden rounded-2xl shadow-sm">
        <Tabs defaultValue="overview">
          <div className="border-b">
            <TabsList className="flex w-full justify-start p-0 bg-transparent h-auto">
              {roleTabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="flex items-center gap-2 rounded-none border-b-2 border-transparent px-4 py-3 transition-all data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:bg-blue-50/50"
                  >
                    <IconComponent className="size-4" />
                    <span className="hidden md:block">{tab.label}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>

          {/* <AssignFacultyDialog
            open={isAssignFacultyDialogOpen}
            onOpenChange={setIsAssignFacultyDialogOpen}
            member={selectedMemberForFaculty}
            faculties={user.schools.flatMap((school) => school.faculties)}
          /> */}

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
                              _count: { endorsements: skill._count?.endorsements || 0 },
                              skillId: skill.id,
                              level: skill.level as any,
                              skill: { category: skill.skill?.category || null },
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
                      {courses.length > 0 ? (
                        <div className="max-h-40 overflow-y-auto">
                          <div className="space-y-2">
                            {courses.slice(0, 3).map((enrollment) => (
                              <div key={enrollment.id} className="border p-2 rounded-md bg-gray-50">
                                <div className="font-medium text-sm">
                                  {enrollment.course.title} ({enrollment.course.code})
                                </div>
                                <div className="text-xs text-gray-500">
                                  {enrollment.course.faculty.name} • {enrollment.course.credits} credits
                                </div>
                                <div className="text-xs text-blue-600 capitalize">
                                  {enrollment.status.toLowerCase()}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="flex h-28 items-center justify-center rounded-lg text-gray-500">
                          <div className="flex flex-col items-center">
                            <Icons.bookOpen className="size-10" />
                            <p className="text-sm">No courses enrolled</p>
                          </div>
                        </div>
                      )}
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
                        jobs.map((application) => (
                          <JobComponent key={application.id} job={application.job} />
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
                        Academics
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-1 border rounded-xl"></CardContent>
                  </Card>
                  <Card className="overflow-hidden rounded-xl border border-gray-100 shadow-sm transition-all hover:border-gray-200 hover:shadow">
                    <CardHeader className="flex items-center justify-between pb-2">
                      <CardTitle className="flex items-center text-lg font-medium">
                        Campus Life
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-1 border rounded-xl"></CardContent>
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
                    jobs.map((application) => (
                      <JobComponent key={application.id} job={application.job} />
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
          <TabsContent value="schools" className="p-4">
            <InstitutionSchoolsContent
              organizationData={organizationData}
              user={user}
              expandedSchools={expandedSchools}
              expandedFaculties={expandedFaculties}
              toggleSchool={toggleSchool}
              toggleFaculty={toggleFaculty}
              onEditSchool={handleEditSchool}
              onDeleteSchool={handleDeleteSchool}
              onDeleteFaculty={handleDeleteFaculty}
            />
          </TabsContent>
          <TabsContent value="analytics" className="p-4">
            <InstitutionAnalyticsContent organizationData={organizationData} />
          </TabsContent>
          <TabsContent value="settings" className="p-4">
            <InstitutionSettingsContent user={user} />
          </TabsContent>
          <TabsContent value="courses" className="p-3">
            <div className="grid grid-cols-1 gap-3">
              <Card className="overflow-hidden rounded-xl border border-gray-100 shadow-sm transition-all hover:border-gray-200 hover:shadow">
                <CardHeader className="flex items-center justify-between pb-4">
                  <CardTitle className="flex items-center text-lg font-medium">
                    <Icons.bookOpen className="mr-3 size-5" />
                    <span>Enrolled Courses</span>
                  </CardTitle>
                  <CardAction>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-full text-green-600 hover:bg-green-50 hover:text-green-800"
                    >
                      <span>View All</span>
                      <Icons.chevronRight className="size-5" />
                    </Button>
                  </CardAction>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-3">
                  {courses.length > 0 ? (
                    courses.map((enrollment) => (
                      <div key={enrollment.id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="font-semibold text-lg">
                              {enrollment.course.title}
                            </div>
                            <div className="text-sm text-gray-600">
                              {enrollment.course.code} • {enrollment.course.faculty.name}
                            </div>
                            <div className="text-sm text-gray-500 mt-1">
                              {enrollment.course.credits ? `${enrollment.course.credits} credits` : 'Credits not specified'}
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              <span className={`px-2 py-1 rounded-full text-xs ${enrollment.status === 'ENROLLED' ? 'bg-green-100 text-green-700' :
                                enrollment.status === 'COMPLETED' ? 'bg-blue-100 text-blue-700' :
                                  enrollment.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-gray-100 text-gray-700'
                                }`}>
                                {enrollment.status.toLowerCase()}
                              </span>
                              {enrollment.grade && (
                                <span className="px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-700">
                                  Grade: {enrollment.grade}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center py-8">
                      <Icons.bookOpen className="size-12 text-gray-400" />
                      <p className="text-gray-500 mt-2">No courses enrolled yet</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-4 rounded-full"
                      >
                        <Icons.add className="size-4 mr-2" />
                        Browse Courses
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
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
                      <ResearchComponent key={item.id} research={item as any} />
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
                {user.clubs && user.clubs.length > 0 ? (
                  user.clubs.map((club) => (
                    <Card key={club.id}>
                      <CardHeader>
                        <CardTitle>{club.name}</CardTitle>
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
                {user.events && user.events.length > 0 ? (
                  user.events.map((event) => (
                    <Card key={event.id}>
                      <CardHeader>
                        <CardTitle>{event.name}</CardTitle>
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
          <TabsContent value="members" className="p-3">
            <div className="grid grid-cols-1 gap-3">
              <Card className="overflow-hidden rounded-xl border border-gray-100 shadow-sm">
                <CardHeader className="flex items-center justify-between pb-4">
                  <CardTitle className="flex items-center text-lg font-medium">
                    <Icons.users className="mr-3 size-5" />
                    <span>Organization Members</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {user.members && user.members.length > 0 ? (
                    <div className="space-y-3">
                      {user.members.map((member) => (
                        <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                              {member.organization?.name?.charAt(0) || 'O'}
                            </div>
                            <div>
                              <div className="font-medium">{member.organization?.name || 'Unknown Organization'}</div>
                              <div className="text-sm text-gray-500 capitalize">
                                {member.role.toLowerCase().replace('_', ' ')}
                              </div>
                              {member.faculty && (
                                <div className="text-xs text-blue-600">
                                  {member.faculty.name}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center py-8">
                      <Icons.users className="size-12 text-gray-400" />
                      <p className="text-gray-500 mt-2">No organization memberships</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Fragment>
  );
}

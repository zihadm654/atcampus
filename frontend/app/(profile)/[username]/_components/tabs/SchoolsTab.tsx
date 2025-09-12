import AcademicStructure from "../academic/AcademicStructure";

export default function SchoolsTab({ organizationData, user, loggedInUserId }: any) {
  const canEdit = user.id === loggedInUserId && user.role === 'INSTITUTION';

  const handleEditSchool = (school: any) => {
    console.log('Edit school:', school);
    // Implementation will be added later
  };

  const handleDeleteSchool = (schoolId: string) => {
    console.log('Delete school:', schoolId);
    // Implementation will be added later
  };

  const handleDeleteFaculty = (facultyId: string) => {
    console.log('Delete faculty:', facultyId);
    // Implementation will be added later
  };

  const handleAddSchool = () => {
    console.log('Add school');
    // Implementation will be added later
  };

  return (
    <AcademicStructure
      organizationData={organizationData}
      canEdit={canEdit}
      onEditSchool={handleEditSchool}
      onDeleteSchool={handleDeleteSchool}
      onDeleteFaculty={handleDeleteFaculty}
      onAddSchool={handleAddSchool}
    />
  );
}
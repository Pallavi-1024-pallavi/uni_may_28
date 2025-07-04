
import FacultyNavbar from "@/components/FacultyNavbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen, UserCheck, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface Course {
  id: string;
  courseId: string;
  name: string;
  description: string;
  facultyId: string;
  facultyName: string;
  isEnabled: boolean;
}

const FacultyDashboard = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [stats, setStats] = useState({
    totalCourses: 0,
    activeCourses: 0,
    totalStudents: 0
  });
  const [formData, setFormData] = useState({
    courseId: "",
    name: "",
    description: ""
  });

  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

  useEffect(() => {
    loadCourses();
  }, [currentUser.id]);

  const loadCourses = () => {
    const savedCourses = JSON.parse(localStorage.getItem('courses') || '[]');
    const facultyCourses = savedCourses.filter((course: Course) => course.facultyId === currentUser.id);
    setCourses(facultyCourses);

    // Calculate stats
    const activeCourses = facultyCourses.filter((course: Course) => course.isEnabled);
    const enrollments = JSON.parse(localStorage.getItem('enrollments') || '[]');
    const studentsInMyCourses = new Set();
    
    facultyCourses.forEach((course: Course) => {
      const courseEnrollments = enrollments.filter((enrollment: any) => enrollment.courseId === course.id);
      courseEnrollments.forEach((enrollment: any) => studentsInMyCourses.add(enrollment.studentId));
    });

    setStats({
      totalCourses: facultyCourses.length,
      activeCourses: activeCourses.length,
      totalStudents: studentsInMyCourses.size
    });
  };

  const handleSubmit = () => {
    if (!formData.courseId || !formData.name || !formData.description) {
      toast.error("Please fill all fields");
      return;
    }

    const newCourse: Course = {
      id: Date.now().toString(),
      ...formData,
      facultyId: currentUser.id,
      facultyName: currentUser.name,
      isEnabled: true
    };

    const existingCourses = JSON.parse(localStorage.getItem('courses') || '[]');
    const updatedCourses = [...existingCourses, newCourse];
    localStorage.setItem('courses', JSON.stringify(updatedCourses));
    window.dispatchEvent(new CustomEvent('coursesUpdated'));

    loadCourses();
    setFormData({ courseId: "", name: "", description: "" });
    setIsAddDialogOpen(false);
    toast.success("Course added successfully");
  };

  const handleEdit = (course: Course) => {
    setEditingCourse(course);
    setFormData({
      courseId: course.courseId,
      name: course.name,
      description: course.description
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = () => {
    if (!formData.courseId || !formData.name || !formData.description) {
      toast.error("Please fill all fields");
      return;
    }

    const existingCourses = JSON.parse(localStorage.getItem('courses') || '[]');
    const updatedCourses = existingCourses.map((course: Course) =>
      course.id === editingCourse?.id
        ? { ...course, ...formData }
        : course
    );
    
    localStorage.setItem('courses', JSON.stringify(updatedCourses));
    window.dispatchEvent(new CustomEvent('coursesUpdated'));

    loadCourses();
    setFormData({ courseId: "", name: "", description: "" });
    setEditingCourse(null);
    setIsEditDialogOpen(false);
    toast.success("Course updated successfully");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <FacultyNavbar currentPage="/faculty/dashboard" />
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Faculty Dashboard</h1>
              <p className="text-gray-600">Welcome to your faculty portal</p>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>Add Course</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Course</DialogTitle>
                  <DialogDescription>Create a new course for students to enroll.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="courseId">Course ID</Label>
                    <Input
                      id="courseId"
                      value={formData.courseId}
                      onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                      placeholder="e.g., CS101"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="name">Course Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Introduction to Computer Science"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Enter course description"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleSubmit}>Save Changes</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Course</DialogTitle>
                  <DialogDescription>Update course information.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="editCourseId">Course ID</Label>
                    <Input
                      id="editCourseId"
                      value={formData.courseId}
                      onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                      placeholder="e.g., CS101"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="editName">Course Name</Label>
                    <Input
                      id="editName"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Introduction to Computer Science"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="editDescription">Description</Label>
                    <Textarea
                      id="editDescription"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Enter course description"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleUpdate}>Save Changes</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
              <div className="p-2 rounded-full bg-blue-500">
                <BookOpen className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCourses}</div>
              <CardDescription className="text-xs text-muted-foreground">
                All courses you've created
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Courses</CardTitle>
              <div className="p-2 rounded-full bg-green-500">
                <UserCheck className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeCourses}</div>
              <CardDescription className="text-xs text-muted-foreground">
                Courses currently active
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <div className="p-2 rounded-full bg-purple-500">
                <Users className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalStudents}</div>
              <CardDescription className="text-xs text-muted-foreground">
                Students enrolled in your courses
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>My Courses</CardTitle>
            <CardDescription>List of courses you have created</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {courses.map((course) => (
                <Card key={course.id} className="hover:shadow-lg transition-shadow duration-300">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{course.name}</CardTitle>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-sm ${course.isEnabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {course.isEnabled ? 'Active' : 'Disabled'}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(course)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <CardDescription>Course ID: {course.courseId}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">{course.description}</p>
                  </CardContent>
                </Card>
              ))}
              {courses.length === 0 && (
                <div className="col-span-full text-center text-gray-500 py-8">
                  No courses created yet. Click "Add Course" to get started.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FacultyDashboard;

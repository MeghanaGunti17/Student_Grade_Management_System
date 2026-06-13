import API from "./api";

export const getStudents = async () => {
  const res = await API.get("/students");
  return res.data;
};

export const getStudentById = async (id) => {
  const res = await API.get(`/students/${id}`);
  return res.data;
};

export const createStudent = async (studentData) => {
  const res = await API.post(
    "/students",
    studentData
  );
  return res.data;
};

export const updateStudent = async (
  id,
  studentData
) => {
  const res = await API.put(
    `/students/${id}`,
    studentData
  );
  return res.data;
};

export const deleteStudent = async (id) => {
  const res = await API.delete(
    `/students/${id}`
  );
  return res.data;
};
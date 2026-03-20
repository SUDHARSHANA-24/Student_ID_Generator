import XLSX from 'xlsx';
import fs from 'fs';

const data = [
    {
        "Register Number": "7376232EC163",
        "Name": "PRABHANYA C",
        "Email": "prabhanya.ec23@bitsathy.ac.in",
        "Official Email": "prabhanya.ec25@bitsathy.ac.in",
        "Department": "Electronics and Communication Engineering",
        "Year": "I",
        "DOB": "12/07/2007",
        "Blood Group": "B-ve",
        "Gender": "Female",
        "Address": "Erode",
        "Student Phone": "9876543213",
        "Parent Phone": "862432453",
        "Student Type": "Hosteller",
        "Photo URL": "C:\\Users\\HOME\\Pictures\\Screenshots\\Screenshot 2026-01-02 222802.png",
        "Valid Upto": "2023-2027",
        "Template": "4"
    },
    {
        "Register Number": "7376231CS101",
        "Name": "ADARSH S",
        "Email": "adarsh.cs23@bitsathy.ac.in",
        "Official Email": "adarsh.cs23@bitsathy.ac.in",
        "Department": "Computer Science Engineering",
        "Year": "II",
        "DOB": "15/05/2006",
        "Blood Group": "O+ve",
        "Gender": "Male",
        "Address": "Coimbatore",
        "Student Phone": "9876543210",
        "Parent Phone": "9876543211",
        "Student Type": "Days Scholar",
        "Photo URL": "",
        "Valid Upto": "2024-2028",
        "Template": "3"
    },
    {
        "Register Number": "7376232IT205",
        "Name": "NANDHINI M",
        "Email": "nandhini.it23@bitsathy.ac.in",
        "Official Email": "nandhini.it23@bitsathy.ac.in",
        "Department": "Information Technology",
        "Year": "III",
        "DOB": "20/09/2005",
        "Blood Group": "A+ve",
        "Gender": "Female",
        "Address": "Sathyamangalam",
        "Student Phone": "9876543212",
        "Parent Phone": "9876543214",
        "Student Type": "Hosteller",
        "Photo URL": "",
        "Valid Upto": "2023-2027",
        "Template": "4"
    }
];

const worksheet = XLSX.utils.json_to_sheet(data);
const workbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(workbook, worksheet, "Students");

const filePath = './Student_Bulk_Import_Template.xlsx';
XLSX.writeFile(workbook, filePath);

console.log(`Excel template created at: ${filePath}`);

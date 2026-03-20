import Student from '../models/Student.js';

describe('Student Model', () => {
    it('should create a student object with default status "Registered"', () => {
        const student = new Student({
            registerNumber: '7376221CS101',
            name: 'John Doe',
            email: 'john@bitsathy.ac.in',
            department: 'COMPUTER SCIENCE ENGINEERING',
            year: 'I'
        });

        expect(student.status).toBe('Registered');
    });

    it('should fail validation if registerNumber is missing', async () => {
        const student = new Student({
            name: 'John Doe',
            email: 'john@bitsathy.ac.in',
            department: 'COMPUTER SCIENCE ENGINEERING',
            year: 'I'
        });

        let err;
        try {
            await student.validate();
        } catch (e) {
            err = e;
        }
        expect(err.errors.registerNumber).toBeDefined();
    });
});

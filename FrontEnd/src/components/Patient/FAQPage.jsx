import React from 'react';
import { Box, Typography, Accordion, AccordionSummary, AccordionDetails, Paper } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const faqs = [
    {
        question: 'How do I book an appointment?',
        answer: 'Navigate to the "Appointments" tab from the main menu. Select an available date and time, provide a reason for your visit, and click "Book Appointment". You will receive a confirmation once it is approved.'
    },
    {
        question: 'Where can I see my lab results?',
        answer: 'Your lab results and other medical documents are available in the "Reports" tab. You can view them online or download them as a PDF.'
    },
    {
        question: 'How do I change my password?',
        answer: 'Go to the "Profile" page. If you registered manually, you will see a "Change Password" form where you can update your credentials.'
    },
    {
        question: 'Is my medical data secure?',
        answer: 'Yes. We use industry-standard encryption and role-based access control to ensure that your medical information is kept private and secure. Only you and authorized healthcare providers can access your records.'
    }
];

const FAQPage = () => {
    return (
        <Box>
            <Typography variant="h4" fontWeight={700} color="primary" mb={4}>
                Frequently Asked Questions (FAQ)
            </Typography>
            <Paper elevation={2} sx={{ p: 2, borderRadius: 4 }}>
                {faqs.map((faq, index) => (
                    <Accordion key={index} sx={{ '&:before': { display: 'none' }, boxShadow: 'none', borderBottom: '1px solid rgba(0, 0, 0, 0.12)' }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography fontWeight={600}>{faq.question}</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Typography color="text.secondary">{faq.answer}</Typography>
                        </AccordionDetails>
                    </Accordion>
                ))}
            </Paper>
        </Box>
    );
};

export default FAQPage;

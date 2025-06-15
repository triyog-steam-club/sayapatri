import { useEffect } from 'react';
import { jsPDF } from 'jspdf';
import { Heart } from 'lucide-react'; 

const Confirmation = ({
  isCurrentSlot,
  formData,
  currentSlot,
  setIsSubmitted,
  setFormData,
}: any) => {

    useEffect(() => {
       const doc = new jsPDF();

        const nepaliDate = 'Aasadh 3, 2082';
        const englishDate = 'June 17, 2025';
        const time = '4:30 PM';

        // Page dimensions
        const pageWidth = doc.internal.pageSize.width;
        const pageHeight = doc.internal.pageSize.height;

        // Header with decorative border
        doc.setDrawColor(220, 53, 69); // Red
        doc.setLineWidth(2);
        doc.rect(10, 10, pageWidth - 20, pageHeight - 20);

        // Inner decorative border
        doc.setDrawColor(255, 193, 7); // Gold
        doc.setLineWidth(0.5);
        doc.rect(15, 15, pageWidth - 30, pageHeight - 30);

        // Title "Sayapatri" in Nepali (using English transliteration with styling)
        doc.setFontSize(28);
        doc.setTextColor(220, 53, 69); // Red
        doc.setFont("helvetica", "bold");
        // Nepali: सयपत्री (using closest representation)
        const nepaliTitle = "Sayapatri";
        const titleWidth = doc.getTextWidth(nepaliTitle);
        doc.text(nepaliTitle, (pageWidth - titleWidth) / 2, 35);

        // Subtitle
        doc.setFontSize(16);
        doc.setTextColor(108, 117, 125); // Gray
        doc.setFont("helvetica", "normal");
        const subtitle = "RSVP Confirmation";
        const subtitleWidth = doc.getTextWidth(subtitle);
        doc.text(subtitle, (pageWidth - subtitleWidth) / 2, 45);

        // Decorative line
        doc.setDrawColor(255, 193, 7); // Gold
        doc.setLineWidth(1);
        doc.line(30, 50, pageWidth - 30, 50);

        let yPosition = 65;

        // Ward Information Section
        doc.setFontSize(14);
        doc.setTextColor(220, 53, 69); // Red
        doc.setFont("helvetica", "bold");
        doc.text("Ward Information", 20, yPosition);
        yPosition += 10;

        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
        doc.setFont("helvetica", "normal");

        // Create a box for ward info
        doc.setFillColor(248, 249, 250);
        doc.rect(20, yPosition - 5, pageWidth - 40, 35, 'F');
        doc.setDrawColor(108, 117, 125); // Gray
        doc.setLineWidth(0.3);
        doc.rect(20, yPosition - 5, pageWidth - 40, 35);

        doc.text(`Ward Name: ${formData.wardName}`, 25, yPosition + 5);
        doc.text(`Class: ${formData.wardClass}`, 25, yPosition + 15);
        doc.text(`Phone: ${formData.phone}`, 25, yPosition + 25);
        doc.text(`Email: ${formData.email}`, 100, yPosition + 25);

        yPosition += 45;

        // Event Details Section
        doc.setFontSize(14);
        doc.setTextColor(220, 53, 69); // Red
        doc.setFont("helvetica", "bold");
        doc.text("Event Details", 20, yPosition);
        yPosition += 10;

        // Slot number with special styling
        doc.setFillColor(255, 193, 7); // Gold
        doc.rect(20, yPosition - 5, 60, 15, 'F');
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text(`Slot #${currentSlot}`, 25, yPosition + 5);

        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
        doc.setFont("helvetica", "normal");
        doc.text(`Participants: ${formData.numberOfParticipants}`, 90, yPosition + 5);

        yPosition += 25;

        // Event date/time or pending message
        if (isCurrentSlot) {
            doc.setFillColor(212, 237, 218);
            doc.rect(20, yPosition - 5, pageWidth - 40, 20, 'F');
            doc.setDrawColor(25, 135, 84);
            doc.setLineWidth(0.5);
            doc.rect(20, yPosition - 5, pageWidth - 40, 20);
            
            doc.setTextColor(25, 135, 84);
            doc.setFont("helvetica", "bold");
            doc.text(`Event Date: ${nepaliDate} / ${englishDate}`, 25, yPosition + 5);
            doc.text(`Time: ${time}`, 25, yPosition + 12);
        } else {
            doc.setFillColor(255, 243, 205);
            doc.rect(20, yPosition - 5, pageWidth - 40, 15, 'F');
            doc.setDrawColor(255, 193, 7);
            doc.setLineWidth(0.5);
            doc.rect(20, yPosition - 5, pageWidth - 40, 15);
            
            doc.setTextColor(133, 77, 14);
            doc.setFont("helvetica", "italic");
            doc.text("⏳ Time slot pending - We'll contact you soon!", 25, yPosition + 5);
        }

        yPosition += 30;

        // Participants Section
        doc.setFontSize(14);
        doc.setTextColor(220, 53, 69); // Red
        doc.setFont("helvetica", "bold");
        doc.text("Participants List", 20, yPosition);
        yPosition += 10;

        // Participants table header
        doc.setFillColor(220, 53, 69); // Red
        doc.rect(20, yPosition - 5, pageWidth - 40, 12, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text("#", 25, yPosition + 3);
        doc.text("Name", 35, yPosition + 3);
        doc.text("Relation", 120, yPosition + 3);

        yPosition += 12;

        // Participants rows
        doc.setTextColor(0, 0, 0);
        doc.setFont("helvetica", "normal");
        formData.participants.forEach((participant: any, index: any) => {
            // Alternate row colors
            if (index % 2 === 0) {
                doc.setFillColor(248, 249, 250);
                doc.rect(20, yPosition - 5, pageWidth - 40, 10, 'F');
            }
            
            doc.text(`${index + 1}`, 25, yPosition + 2);
            doc.text(participant.name, 35, yPosition + 2);
            doc.text(participant.relationToStudent, 120, yPosition + 2);
            yPosition += 10;
        });

        // Footer
        yPosition = pageHeight - 40;
        doc.setDrawColor(255, 193, 7); // Gold
        doc.setLineWidth(1);
        doc.line(30, yPosition, pageWidth - 30, yPosition);

        doc.setFontSize(9);
        doc.setTextColor(108, 117, 125); // Gray
        doc.setFont("helvetica", "italic");
        const footerText = "Thank you for your RSVP! We look forward to seeing you at the event.";
        const footerWidth = doc.getTextWidth(footerText);
        doc.text(footerText, (pageWidth - footerWidth) / 2, yPosition + 10);

        // Generated timestamp
        const timestamp = new Date().toLocaleString();
        doc.text(`Generated on: ${timestamp}`, 20, yPosition + 20);

        // Save the PDF
        doc.save('sayapatri-rsvp-confirmation.pdf');
     }, []);

    return (
      <div className="flex flex-col items-center justify-center min-w-screen min-h-screen bg-[#262626] text-white">
        <div className="max-w-md w-full text-center">
          <div className="mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-[#F28705] to-[#F29F05] rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-4">Thank You!</h1>
            <p className="text-gray-300 text-lg mb-4">
              Your RSVP for Sayapatri has been confirmed.
            </p>

            {isCurrentSlot ? (
              <div className="text-sm text-green-300">
                Your scheduled time is:<br />
                <strong>Aasadh 3, 2082 / June 17, 2025 at 4:30 PM</strong>
              </div>
            ) : (
              <div className="text-sm text-yellow-400">
                Your time slot is not finalized yet. We will inform you soon.
              </div>
            )}
          </div>

          <button 
            onClick={() => {
              setIsSubmitted(false);
              setFormData({
                wardName: '',
                wardClass: '',
                numberOfParticipants: 1,
                email: '',
                phone: '',
                participants: [{ name: '', relationToStudent: '' }]
              });
            }}
            className="px-6 py-3 bg-gradient-to-r from-[#F28705] to-[#F29F05] text-white rounded-full hover:from-[#F29F05] hover:to-[#F28705] transition-all duration-300 transform hover:scale-105"
          >
            Back to Home
          </button>
        </div>
      </div>
    );

  return null;
};

export default Confirmation;
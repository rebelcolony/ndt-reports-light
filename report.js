document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('ndt-report-form');
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Collect all form data
        const formData = new FormData(form);
        const reportData = {};
        
        // Convert FormData to regular object
        for (let [key, value] of formData.entries()) {
            reportData[key] = value;
        }
        
        // Structure probe data
        reportData.probes = [];
        for (let i = 1; i <= 4; i++) {
            const probe = {
                angle: reportData[`probe_angle_${i}`] || '',
                frequency: reportData[`probe_frequency_${i}`] || '',
                serial: reportData[`probe_serial_${i}`] || '',
                diameter: reportData[`probe_diameter_${i}`] || ''
            };
            
            // Only add probe if at least one field is filled
            if (probe.angle || probe.frequency || probe.serial || probe.diameter) {
                reportData.probes.push(probe);
            }
            
            // Clean up individual probe fields from reportData
            delete reportData[`probe_angle_${i}`];
            delete reportData[`probe_frequency_${i}`];
            delete reportData[`probe_serial_${i}`];
            delete reportData[`probe_diameter_${i}`];
        }
        
        try {
            // Show loading state
            const submitButton = form.querySelector('button[type="submit"]');
            const originalText = submitButton.textContent;
            submitButton.textContent = 'Generating PDF...';
            submitButton.disabled = true;
            
            // Debug: Log the data being sent (remove in production)
            console.log('Sending report data:', JSON.stringify(reportData, null, 2));
            
            // Send to external API endpoint - replace with your actual service URL
            const response = await fetch('https://pdf.rebelcolony.com/generate/ndt-report', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(reportData)
            });
            
            if (response.ok) {
                // Handle successful response
                const blob = await response.blob();
                
                // Create download link
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `NDT_Report_${reportData.inspection_date || 'report'}.pdf`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
                
                alert('PDF report generated successfully!');
            } else {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Error generating PDF report. Please try again.');
        } finally {
            // Reset button state
            const submitButton = form.querySelector('button[type="submit"]');
            submitButton.textContent = originalText;
            submitButton.disabled = false;
        }
    });
});

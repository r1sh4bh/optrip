import { OptimizedRoute } from "@/types";
import { formatDistance, formatDuration, formatDate, formatTime } from "./utils";

/**
 * Export itinerary as PDF
 * Uses browser's print dialog to generate PDF
 */
export function exportToPDF(optimizedRoute: OptimizedRoute, tripName: string = "Road Trip") {
  const { stops, totalDistance, totalDuration, drivingDays } = optimizedRoute;

  // Group stops by day
  const stopsByDay: { [key: number]: typeof stops } = {};
  stops.forEach((stop) => {
    if (!stopsByDay[stop.dayNumber]) {
      stopsByDay[stop.dayNumber] = [];
    }
    stopsByDay[stop.dayNumber].push(stop);
  });

  // Create a print-friendly HTML document
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Please allow popups to export PDF");
    return;
  }

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${tripName} - Itinerary</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 20px;
            color: #111827;
          }
          h1 {
            font-size: 28px;
            color: #1e40af;
            margin-bottom: 10px;
          }
          .summary {
            display: flex;
            gap: 30px;
            margin: 30px 0;
            padding: 20px;
            background: #eff6ff;
            border-radius: 8px;
          }
          .summary-item {
            flex: 1;
          }
          .summary-label {
            font-size: 12px;
            color: #6b7280;
            margin-bottom: 5px;
          }
          .summary-value {
            font-size: 24px;
            font-weight: bold;
            color: #1e40af;
          }
          .day {
            margin-bottom: 40px;
            page-break-inside: avoid;
          }
          .day-header {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 20px;
          }
          .day-number {
            width: 40px;
            height: 40px;
            background: #1e40af;
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
          }
          .day-title {
            font-size: 20px;
            font-weight: bold;
          }
          .stop {
            margin-left: 20px;
            padding: 15px;
            border-left: 3px solid #e5e7eb;
            margin-bottom: 20px;
          }
          .stop-name {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 5px;
          }
          .stop-address {
            font-size: 14px;
            color: #6b7280;
            margin-bottom: 10px;
          }
          .stop-times {
            font-size: 14px;
            color: #374151;
          }
          .overnight-badge {
            display: inline-block;
            background: #fef3c7;
            color: #92400e;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 500;
            margin-left: 10px;
          }
          .accommodation-note {
            margin-top: 10px;
            padding: 10px;
            background: #fef3c7;
            border-left: 3px solid #f59e0b;
            font-size: 13px;
            color: #92400e;
          }
          .tips {
            margin-top: 40px;
            padding: 20px;
            background: #f3f4f6;
            border-radius: 8px;
          }
          .tips h3 {
            font-size: 16px;
            margin-bottom: 10px;
          }
          .tips ul {
            margin: 0;
            padding-left: 20px;
          }
          .tips li {
            margin-bottom: 5px;
            font-size: 14px;
            color: #4b5563;
          }
          @media print {
            body {
              padding: 20px;
            }
          }
        </style>
      </head>
      <body>
        <h1>${tripName}</h1>
        <p style="color: #6b7280; margin-bottom: 30px;">Generated on ${new Date().toLocaleDateString()}</p>

        <div class="summary">
          <div class="summary-item">
            <div class="summary-label">Total Distance</div>
            <div class="summary-value">${formatDistance(totalDistance)}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">Driving Time</div>
            <div class="summary-value">${formatDuration(totalDuration)}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">Trip Duration</div>
            <div class="summary-value">${drivingDays} ${drivingDays === 1 ? 'day' : 'days'}</div>
          </div>
        </div>

        ${Object.entries(stopsByDay).map(([day, dayStops]) => `
          <div class="day">
            <div class="day-header">
              <div class="day-number">${day}</div>
              <div>
                <div class="day-title">Day ${day}</div>
                <div style="color: #6b7280; font-size: 14px;">${formatDate(dayStops[0].arrivalTime)}</div>
              </div>
            </div>

            ${dayStops.map((stop) => `
              <div class="stop">
                <div class="stop-name">
                  ${stop.waypoint.name}
                  ${stop.isOvernight ? '<span class="overnight-badge">Overnight</span>' : ''}
                </div>
                <div class="stop-address">${stop.waypoint.address || ''}</div>
                <div class="stop-times">
                  <strong>Arrive:</strong> ${formatTime(stop.arrivalTime)}
                  ${stop.stopDuration > 0 ? `
                    &nbsp;•&nbsp;
                    <strong>${stop.isOvernight ? 'Overnight stay' : `${stop.stopDuration} min stop`}</strong>
                    &nbsp;•&nbsp;
                    <strong>Depart:</strong> ${formatTime(stop.departureTime)}
                  ` : ''}
                </div>
                ${stop.accommodationNeeded ? `
                  <div class="accommodation-note">
                    🏨 Book accommodation for the night
                  </div>
                ` : ''}
              </div>
            `).join('')}
          </div>
        `).join('')}

        <div class="tips">
          <h3>Trip Tips</h3>
          <ul>
            <li>Plan to book accommodations in advance at overnight stops</li>
            <li>Add buffer time for meals, rest stops, and unexpected delays</li>
            <li>Check weather conditions before departure</li>
            <li>Keep emergency contacts and roadside assistance info handy</li>
          </ul>
        </div>

        <script>
          window.onload = function() {
            window.print();
            window.onafterprint = function() {
              window.close();
            };
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}

/**
 * Export itinerary to Google Calendar (.ics format)
 */
export function exportToCalendar(optimizedRoute: OptimizedRoute, tripName: string = "Road Trip") {
  const { stops } = optimizedRoute;

  // Generate ICS file content
  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//OpTrip//Road Trip Planner//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:" + tripName,
    "X-WR-TIMEZONE:UTC",
  ];

  stops.forEach((stop, index) => {
    const isFirstStop = index === 0;
    const isLastStop = index === stops.length - 1;

    let summary = "";
    let description = "";

    if (isFirstStop) {
      summary = `Start Trip: ${stop.waypoint.name}`;
      description = `Departure from ${stop.waypoint.name}`;
    } else if (isLastStop) {
      summary = `Arrive at ${stop.waypoint.name}`;
      description = `Final destination: ${stop.waypoint.name}`;
    } else if (stop.isOvernight) {
      summary = `Overnight Stop: ${stop.waypoint.name}`;
      description = `Book accommodation at ${stop.waypoint.name}`;
    } else {
      summary = `Rest Stop: ${stop.waypoint.name}`;
      description = `${stop.stopDuration} minute break at ${stop.waypoint.name}`;
    }

    if (stop.waypoint.address) {
      description += `\\n\\nAddress: ${stop.waypoint.address}`;
    }

    const startTime = formatICSDate(stop.arrivalTime);
    const endTime = formatICSDate(stop.departureTime);

    icsContent.push(
      "BEGIN:VEVENT",
      `UID:${Date.now()}-${index}@optrip.app`,
      `DTSTAMP:${formatICSDate(new Date())}`,
      `DTSTART:${startTime}`,
      `DTEND:${endTime}`,
      `SUMMARY:${summary}`,
      `DESCRIPTION:${description}`,
      `LOCATION:${stop.waypoint.address || stop.waypoint.name}`,
      "STATUS:CONFIRMED",
      "SEQUENCE:0",
      "END:VEVENT"
    );
  });

  icsContent.push("END:VCALENDAR");

  // Create and download the ICS file
  const blob = new Blob([icsContent.join("\r\n")], {
    type: "text/calendar;charset=utf-8",
  });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${tripName.replace(/\s+/g, "_")}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Format date for ICS file (YYYYMMDDTHHMMSSZ)
 */
function formatICSDate(date: Date): string {
  const pad = (n: number) => (n < 10 ? "0" + n : n.toString());
  return (
    date.getUTCFullYear().toString() +
    pad(date.getUTCMonth() + 1) +
    pad(date.getUTCDate()) +
    "T" +
    pad(date.getUTCHours()) +
    pad(date.getUTCMinutes()) +
    pad(date.getUTCSeconds()) +
    "Z"
  );
}

/**
 * Generate shareable link
 */
export function generateShareLink(
  optimizedRoute: OptimizedRoute,
  tripData: {
    googleMapsLink: string;
    maxDrivingHours: number;
    departureTime?: Date;
    avoidHighways?: boolean;
    avoidTolls?: boolean;
  }
): string {
  // Encode the trip data as base64
  const data = {
    googleMapsLink: tripData.googleMapsLink,
    maxDrivingHours: tripData.maxDrivingHours,
    departureTime: tripData.departureTime,
    avoidHighways: tripData.avoidHighways,
    avoidTolls: tripData.avoidTolls,
  };

  const encoded = btoa(JSON.stringify(data));
  const url = `${window.location.origin}?trip=${encoded}`;

  // Copy to clipboard
  navigator.clipboard.writeText(url).then(
    () => {
      alert("Link copied to clipboard!");
    },
    (err) => {
      console.error("Failed to copy link:", err);
      prompt("Copy this link:", url);
    }
  );

  return url;
}

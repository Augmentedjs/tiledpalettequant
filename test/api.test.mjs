import dotenv from "dotenv";
import { strict as assert } from "assert";

dotenv.config();

const BASE_URL = process.env.BASE_URL || "http://localhost:8080";

const CAREGIVERS_API_URL = "/api/caregivers";
const TIMESHEETS_API_URL = "/api/timesheets";
const PROFILES_API_URL = "/api/profiles";
const HOLIDAYS_API_URL = "/api/holidays";
const MAPS_API_URL = "/api";

describe("API Tests", () => {
  let createdCaregiverName;
  let createdTimesheetId;
  let createdProfileId;

  const request = async (url, options = {}) => {
    const res = await fetch(url, {
      headers: { "Content-Type": "application/json", ...(options.headers || {}) },
      ...options
    });
    if (!res.ok) {
      console.warn(`${res.status}: ${res.statusText}`);
    }
    let body = null;
    if (res.status !== 204) {
      body = await res.json().catch((e) => console.error(e));
    }
    return { status: res.status, body };
  };

  // Caregivers API Tests
  describe("CAREGIVERS API", () => {
    it("should fetch all caregivers", async () => {
      const { status, body } = await request(`${BASE_URL}${CAREGIVERS_API_URL}`);
      assert.equal(status, 200);
      assert.ok(Array.isArray(body.caregivers));
    });

    it("should create a new caregiver", async () => {
      const newCaregiver = {
        name: "Jane Doe",
        address: "123 nothing st.",
        city: "nowhere",
        state: "xx",
        zip: "12345",
        phone: "123-456-7890",
        email: "jane@example.com"
      };
      const { status, body } = await request(`${BASE_URL}${CAREGIVERS_API_URL}`, {
        method: "POST",
        body: JSON.stringify(newCaregiver)
      });
      if (status !== 201) {
        console.error(body);
      }
      assert.equal(status, 201);
      createdCaregiverName = newCaregiver.name;
    });

    it("should update a caregiver", async () => {
      const updatedCaregiver = { name: "Jane Doe",
      address: "123 Updated St.",
      city: "nowhere",
      state: "xx",
      zip: "12345",
      phone: "123-456-7890",
      email: "jane@example.com" };
      const { status, body } = await request(
        `${BASE_URL}${CAREGIVERS_API_URL}/${encodeURIComponent(createdCaregiverName)}`,
        {
          method: "PUT",
          body: JSON.stringify(updatedCaregiver)
        }
      );
      if (status !== 200) {
        console.error(body);
      }
      assert.equal(status, 200);
      assert.equal(body.message, "Caregiver updated successfully");
    });

    it("should delete a caregiver", async () => {
      const { status } = await request(
        `${BASE_URL}${CAREGIVERS_API_URL}/${encodeURIComponent(createdCaregiverName)}`,
        {
          method: "DELETE"
        }
      );
      if (status !== 204) {
        console.error(body);
      }
      assert.equal(status, 204);
    });
  });

  // Timesheets API Tests
  describe("TIMESHEETS API", () => {
    it("should fetch all timesheets", async () => {
      const { status, body } = await request(`${BASE_URL}${TIMESHEETS_API_URL}`);
      assert.equal(status, 200);
      assert.ok(Array.isArray(body));
    });

    it("should create a new timesheet", async () => {
      const newTimesheet = {
        name: "John Doe",
        payrollStartDate: "2025-01-05T15:23:42.123Z",
        entries: [
          {
            date: "2025-01-05T09:00:00.000Z",
            startHour: "08:00",
            endHour: "17:00",
            totalHours: 9,
            regularHours: 8,
            overtimeHours: 1,
            doubleTimeHours: 0
          }
        ]
      };
      const { status, body } = await request(`${BASE_URL}${TIMESHEETS_API_URL}`, {
        method: "POST",
        body: JSON.stringify(newTimesheet)
      });
      if (status !== 201) {
        console.error(body);
      }
      assert.equal(status, 201);
      createdTimesheetId = `${newTimesheet.name}:${newTimesheet.payrollStartDate}`;
    });

    it("should update a timesheet", async () => {
      const updatedTimesheet = {
        name: "John Doe",
        payrollStartDate: "2025-01-06T15:23:42.123Z",
        notes: "Updated notes",
        entries: []
      };
      const { status, body } = await request(
        `${BASE_URL}${TIMESHEETS_API_URL}/${encodeURIComponent(createdTimesheetId)}`,
        {
          method: "PUT",
          body: JSON.stringify(updatedTimesheet)
        }
      );
      if (status !== 200) {
        console.error(body);
      }
      assert.equal(status, 200);
      assert.equal(body.message, "Timesheet updated successfully.");
    });

    it("should delete a timesheet", async () => {
      const { status } = await request(
        `${BASE_URL}${TIMESHEETS_API_URL}/${encodeURIComponent(createdTimesheetId)}`,
        {
          method: "DELETE"
        }
      );
      if (status !== 204) {
        console.error(body);
      }
      assert.equal(status, 204);
    });
  });

  // Profiles API Tests
  describe("PROFILES API", () => {
    it("should fetch all profiles", async () => {
      const { status, body } = await request(`${BASE_URL}${PROFILES_API_URL}`);
      assert.equal(status, 200);
      assert.ok(Array.isArray(body.profiles));
    });

    it("should create a new profile", async () => {
      const newProfile = { id: "12345", emails: [{ value: "12345@nothing.com", verified: true}], role: "caregiver" };
      const { status, body } = await request(`${BASE_URL}${PROFILES_API_URL}`, {
        method: "POST",
        body: JSON.stringify(newProfile)
      });
      assert.equal(status, 201);
      createdProfileId = body.insertedId;
    });

    it("should get a specific profile", async () => {
      const newProfile = { id: "12345", emails: [{ value: "12345@nothing.com", verified: true}], role: "caregiver" };
      const { status, body } = await request(`${BASE_URL}${PROFILES_API_URL}/${newProfile.id}`, {
        method: "GET"
      });
      assert.equal(status, 200);
      createdProfileId = body.insertedId;
      assert.ok(body);
    });

    it("should update a profile", async () => {
      createdProfileId = "admin";
      const updatedProfile = { role: "caregiver" };
      const { status, body } = await request(
        `${BASE_URL}${PROFILES_API_URL}/${encodeURIComponent(createdProfileId)}`,
        {
          method: "PUT",
          body: JSON.stringify(updatedProfile)
        }
      );
      assert.equal(status, 200);
      assert.equal(body.message, "Profile updated successfully");
    });

    it("should delete a profile", async () => {
      createdProfileId = "12345";
      const { status } = await request(
        `${BASE_URL}${PROFILES_API_URL}/${encodeURIComponent(createdProfileId)}`,
        {
          method: "DELETE"
        }
      );
      assert.equal(status, 204);
    });
  });

  // Maps API Tests
  describe("MAPS API", () => {
    it("should fetch autocomplete suggestions", async () => {
      const { status, body } = await request(`${BASE_URL}${MAPS_API_URL}/autocomplete?input=Test`);
      assert.equal(status, 200);
      assert.ok(Array.isArray(body));
    });

    it("should fetch address details", async () => {
      const { status, body } = await request(
        `${BASE_URL}${MAPS_API_URL}/address-details?placeId=ChIJd8BlQ2BZwokRAFUEcm_qrcA`
      );
      assert.equal(status, 200);
      assert.ok(body);
    });
  });

  describe("HOLIDAYS API", () => {
    it("should fetch holidays", async () => {
      const { status, body } = await request(`${BASE_URL}${HOLIDAYS_API_URL}`);
      assert.equal(status, 200);
      assert.ok(Array.isArray(body));
    });
  });
});

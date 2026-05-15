import requests
import json
import time
import subprocess
import os

BASE_URL = "http://localhost:3001/api/courses"

def test_persistence():
    # 1. Add a new course
    new_course = {
        "id": "PERSIST-TEST",
        "title": "Persistence Test Course",
        "category": "WSQ",
        "level": "Intermediate",
        "description": "Test description",
        "duration": "8 Hours",
        "url": "http://test.com",
        "objectives": ["Objective 1"],
        "targetAudience": ["Audience 1"]
    }

    print("Adding course...")
    r = requests.post(BASE_URL, json=new_course)
    r.raise_for_status()

    # 2. Verify it's there
    r = requests.get(f"{BASE_URL}")
    courses = r.json()
    assert any(c['id'] == "PERSIST-TEST" for c in courses), "Course not found after add"
    print("Course added and verified.")

    # 3. Restart backend
    print("Restarting backend...")
    subprocess.run("kill $(lsof -t -i :3001)", shell=True)
    time.sleep(2)
    subprocess.run("npx tsx server.ts > server_test.log 2>&1 &", shell=True)
    time.sleep(5)

    # 4. Verify it's STILL there
    r = requests.get(f"{BASE_URL}")
    courses = r.json()
    course = next((c for c in courses if c['id'] == "PERSIST-TEST"), None)
    assert course is not None, "Course lost after restart!"

    # Verify new fields
    # SQLite returns JSON strings for these in my current implementation, dbService parses them.
    # In the raw API response from server.ts:
    assert 'objectives' in course, "objectives field missing"
    assert 'targetAudience' in course, "targetAudience field missing"

    objs = json.loads(course['objectives'])
    auds = json.loads(course['targetAudience'])

    assert objs == ["Objective 1"], f"Objectives mismatch: {objs}"
    assert auds == ["Audience 1"], f"Audience mismatch: {auds}"

    print("Persistence verified! Course and new fields survived restart.")

    # 5. Cleanup
    requests.delete(f"{BASE_URL}/PERSIST-TEST")
    print("Cleanup done.")

if __name__ == "__main__":
    test_persistence()

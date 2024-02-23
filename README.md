# ExerciseTracker_MicroService

This repository contains an API for a fitness tracker application. It provides endpoints to manage users and their exercise logs.

## Installation and Install Dependencies
```bash
git clone <repository_url>

npm install
```

## Setup ENV Variables
- ENV=PROD (Disabled all Console Logs)

## Usage
```bash
npm start
```

## Endpoints

1. Create New User

    URL: /api/users

    Method: POST

    Description: Creates a new user in the system.

    Request Body:
    ```bash
        {
        "username": "example_user"
        }
    ```
    Response:
    ```bash
        {
        "username": "example_user",
        "_id": "65d6c82ea2696c3e0fd50097"
        }
    ```

2. Get User's Exercise Logs

    URL: /api/users/:_id/logs

    Method: GET

    Description: Retrieves exercise logs for the specified user.

    Parameters:
        _id: User ID
        from: Start date for filtering (optional)
        to: End date for filtering (optional)
        limit: Limit the number of logs (optional)

    Response:
    ```bash
        {
        "username": "example_user",
        "count": 3,
        "_id": "65d6c82ea2696c3e0fd50097",
        "log": [
            {
            "description": "test1",
            "duration": 10,
            "date": "Sat Jan 01 2000 00:00:00 GMT-0600 (Central Standard Time)"
            },
            {
            "description": "test2",
            "duration": 20,
            "date": "Sun Aug 15 2010 00:00:00 GMT-0500 (Central Daylight Time)"
            },
            {
            "description": "test3",
            "duration": 30,
            "date": "Fri Apr 10 2020 00:00:00 GMT-0500 (Central Daylight Time)"
            }
        ]
        }
    ```
3. Post New Exercise

    URL: /api/users/:_id/exercises

    Method: POST

    Description: Adds a new exercise log for the specified user.

    Parameters:
        _id: User ID

    Request Body:
    ```bash
        {
        "description": "Running",
        "duration": 30,
        "date": "2023-10-01"
        }
    ```
    Response:
    ```bash
        {
        "_id": "65d6c82ea2696c3e0fd50097",
        "username": "example_user",
        "date": "Fri Oct 01 2023",
        "duration": 30,
        "description": "Running"
        }
    ```

4. Delete User

    URL: /api/users/:_id/delete

    Method: DELETE

    Description: Deletes the specified user.

    Parameters:
        _id: User ID

    Response:
    ```bash
        {
        "HTTP/200": "Deletion Successful for 65d6c82ea2696c3e0fd50097"
        }
    ```
License

This project is licensed under the MIT License - see the LICENSE file for details.
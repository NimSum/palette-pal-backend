# Palette Pal API [![Build Status](https://travis-ci.org/NimSum/palette-pal-backend.svg?branch=master)](https://travis-ci.org/NimSum/palette-pal-backend)

#### By [Lynne Rang](https://github.com/lynnerang) & [Nim Garcia](https://github.com/nimsum)

### An api created to store and provide color palettes for users.

#### [A Front-End app using this API](https://github.com/NimSum/palette-pal-frontend)

## Table of contents
* [Getting Started](#Getting-Started)
* [Documentation](#Docs)
  * [Login/Signup](#User-Authentication)
  * [Get](#Get)
  * [POST](#POST)
  * [DELETE](#DELETE)
  * [PUT](#PUT)
* [Project Emphasis](#Project-Emphasis)
* [Future Plans](#Future-Plans) 


## Getting Started

If you'd like to clone this repository to your own local machine, run the following command in your terminal:

```shell
https://github.com/NimSum/palette-pal-backend
```

Then run the following command to install dependencies:

```shell
npm install
```

To view the app in action, run the following command in your terminal:

```bash
npm start
```

Then, go to `http://localhost:3005/` in your browser to see the code running in the browser.

---

## Docs

#### ROOT URL: `https://palette-pal-be.herokuapp.com/`

### User-Authentication
   ##### Required Headers:
  - `Content-Type: application/json`
  
  | `Authorization`| `Bearer <User Token Here>`| ##(Required for User validation for updating projects/palettes) 
  
  - ### Signup
   #### Path: `/auth/signup`
   ##### Required Params:
  | Type         | value     | Description                             |
  | ------------ |-----------| ------------                            |
  | `user_name`   | `<user name>`| Your users username as a string |
  | `email`      | `<user email>`| Your users email as a string |
  | `password`   | `<user password>`| Your users password as a string |
  - EXAMPLE RESPONSE:
  ```json
  // The server responds with the new user id, the user must login after account creation
  5
  ```
  
 - ### Login
   #### Path: `/auth/login`
   ##### Required Params:
  | Type         | value     | Description                             |
  | ------------ |-----------| ------------                            |
  | `email`      | `<user email>`| Your users email as a string |
  | `password`   | `<user password>`| Your users password as a string |
  
   #### NOTE: Successful logins has a token attached to the response, this token expires within 7 days of successful login
  
   - EXAMPLE RESPONSE:
   ```json
    {
      "token": "<the user's token(expires in 7 days)>",
      "user_id": 2,
      "projects": [
          {
              "user_id": 2,
              "project_name": "Project ONE",
              "project_id": 1,
              "palette_name": "Lynnes Palette",
              "palette_id": 2,
              "color_1": "#488047",
              "color_2": "#925578",
              "color_3": "#319547",
              "color_4": "#796876",
              "color_5": "#834267"
          }
      ]
    }
  ```


### Get All Projects
- Returns all projects within the database
#### Path: `/api/v1/projects`
##### Optional Queries:
| Name         | value     | Description                             |
| ------------ |-----------| ------------                            |
| `palettes`   | `included`| Includes all palettes with their associated projects and users |

- EXAMPLE RESPONSE:
```json
[
    {
        "id": 1,
        "project_name": "Project ONE",
        "user_id": 2,
        "created_at": "2019-07-07T23:22:30.020Z",
        "updated_at": "2019-07-07T23:22:30.020Z"
    },
    {
        "id": 2,
        "project_name": "Project TWO",
        "user_id": 1,
        "created_at": "2019-07-07T23:22:30.020Z",
        "updated_at": "2019-07-07T23:22:30.020Z"
    }
]
```

### Get Specific Projects
- Returns individual projects within the database
#### Path: `/api/v1/projects/:id`

- EXAMPLE RESPONSE:
```json
{
    "id": 1,
    "project_name": "Project ONE",
    "user_id": 2,
    "created_at": "2019-07-07T23:22:30.020Z",
    "updated_at": "2019-07-07T23:22:30.020Z"
}
```

### Get All Palettes
- Returns all palettes within the database
#### Path: `/api/v1/palettes`
- EXAMPLE RESPONSE:
```json
[
    {
        "id": 1,
        "palette_name": "Nims Palette",
        "project_id": 2,
        "color_1": "#123456",
        "color_2": "#654321",
        "color_3": "#333547",
        "color_4": "#798776",
        "color_5": "#839967",
        "created_at": "2019-07-07T23:22:30.023Z",
        "updated_at": "2019-07-07T23:22:30.023Z"
    },
    {
        "id": 2,
        "palette_name": "Lynnes Palette",
        "project_id": 1,
        "color_1": "#488047",
        "color_2": "#925578",
        "color_3": "#319547",
        "color_4": "#796876",
        "color_5": "#834267",
        "created_at": "2019-07-07T23:22:30.023Z",
        "updated_at": "2019-07-07T23:22:30.023Z"
    }
]
```

## Future Plans
- In work
-


## Project Emphasis

- [x] Node.js/Express
- [x] Knex
- [x] Relational Databases
- [x] SQL
- [x] Postgres
- [x] JWT Authentication
- [x] Express Middlewares

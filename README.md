# cents
> API docs [_here_](https://cents-0ium.onrender.com/api-docs/).

## Table of Contents
- [cents](#cents)
  - [Table of Contents](#table-of-contents)
  - [General Information](#general-information)
    - [Tech used](#tech-used)
    - [Installation](#installation)
      - [Using Git](#using-git)
    - [Running tests](#running-tests)
    - [Setting up environments](#setting-up-environments)
    - [Usage](#usage)
  - [Project Status](#project-status)
  - [Features](#features)
  - [Contact](#contact)

## General Information
- A REST API that automates generating of invoices and sends recurrent mails to clients on behalf of freelancers.
- This project aims to reduce client management time for freelancers.

### Tech used
**Runtime environment**
- [x] Node.js

**Database**
- [x] MongoDB

**ODM**
- [x] Mongoose

**Testing framework**
- [x] Jest
- [x] Supertest

**Language**
- [x] Typescript
  
**Framework**
- [x] Express
  
**Job scheduler**
- [x] Agenda
  
**Queue**
- [x] Redis
  
### Installation
#### Using Git
1. Navigate & open CLI into the directory where you want to put this project & clone this project using this command.
   
```bash
git clone https://github.com/Adedunmol/cents-typescript.git
```
2. Run `npm install` to install all dependencies

### Running tests
* Run `npm run test` to run unit tests.


### Setting up environments
1. There is a file named `.env.example` on the root directory of the project
2. Create a new file by copying & pasting the file on the root directory & rename it to just `.env`
3. The `.env` file is already ignored, so your credentials inside it won't be committed
4. Change the values of the file. Make changes of comment to the `.env.example` file while adding new constants to the `.env` file.

### Usage
* Run `npm run dev` to start the application.
* Connect to the API using Postman on port 3000.


## Project Status
Project is: _in progress_.

## Features
- Automatic sending of emails on due date for invoice to clients.
- Generation of invoices.
- Sending of reminder mails after due date based on frequency and interval set by users(freelancers)


## Contact
Created by [@Adedunmola](oyewaleadedunmola@gmail.com) - feel free to contact me!
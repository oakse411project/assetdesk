# Requirements specification

**Project:** AssetDesk, an IT equipment inventory (SE411 Project, Part 1)
**Asset type chosen:** IT equipment

## 1. Purpose

Companies need to know which IT devices they own, who has them, where they are and when warranties run out. Spreadsheets get out of date and are hard to search. AssetDesk gives the IT team one place to record, find and update this equipment.

## 2. Scope of Part 1

- A frontend application built with React.
- Data is stored as an in-memory collection of JavaScript objects; there is no database or backend.
- Any changes are lost when the page is reloaded.
- A backend and persistent storage are out of scope and come in Part 2.

## 3. Users

| User | Goal |
|---|---|
| IT administrator | Record new equipment, keep assignments and status current, retire old devices |
| IT manager | See what needs attention (repairs, expiring warranties) and the overall inventory |

## 4. Data model: Asset

| Field | Type | Required | Rules |
|---|---|---|---|
| id | string | auto | Generated unique id, not shown or editable |
| assetTag | string | yes | Format `IT-` + 4 or more digits; unique (case-insensitive); stored in upper case |
| category | enum | yes | Laptop, Desktop, Monitor, Printer, Phone, Tablet, Server, Network device |
| brand | string | yes | Up to 60 characters |
| model | string | yes | Up to 60 characters |
| serialNumber | string | yes | Letters, digits and dashes only; unique (case-insensitive) |
| status | enum | yes | In use, In storage, Under repair, Retired |
| assignedTo | string | when status is "In use" | Up to 60 characters |
| department | enum | yes | Engineering, Finance, Human Resources, Marketing, Operations, Sales, IT |
| location | string | no | Up to 60 characters |
| purchaseDate | date | yes | Valid calendar date |
| purchaseCost | number | yes | 0 or more, in SAR |
| warrantyExpiry | date | yes | Valid date, not before purchaseDate |
| notes | string | no | Up to 500 characters |

## 5. Functional requirements

| ID | Requirement |
|---|---|
| FR-1 | The app shall be a React project. |
| FR-2 | The app shall provide a menu to navigate between Dashboard, Assets, Add asset and About. The current page is highlighted. |
| FR-3 | The app shall display all assets in a table showing tag, device, assigned person and department, status and warranty. |
| FR-4 | The app shall show a details page for a single asset with all of its fields. |
| FR-5 | The user shall be able to add an asset through a form. The next free asset tag is suggested. |
| FR-6 | The user shall be able to update any field of an existing asset. |
| FR-7 | The user shall be able to delete an asset after confirming. Deletion is possible from the list and the details page. |
| FR-8 | The user shall be able to search assets by free text across tag, brand, model, serial number, assigned person, department, location and category. Every word typed must match. |
| FR-9 | The user shall be able to filter by category and status, combine filters with search, and clear all filters. |
| FR-10 | The user shall be able to sort the table by any column, ascending or descending. |
| FR-11 | The form shall validate input against the rules in section 4 and show a clear message next to each invalid field. |
| FR-12 | The dashboard shall show the total number and value of assets, assets that need attention (under repair or warranty ending within 90 days), and counts by status and category that link to the filtered list. |
| FR-13 | The app shall include an About page listing each team member's name and student ID. |
| FR-14 | The app shall confirm completed actions (added, saved, deleted) with a short message. |
| FR-15 | The app shall show a helpful page for unknown addresses and for assets that no longer exist. |

## 6. Non-functional requirements

| ID | Requirement |
|---|---|
| NFR-1 | **Usability:** every action is reachable in at most two clicks from the menu; labels use plain language. |
| NFR-2 | **Accessibility:** all form fields have labels, errors are linked to fields, focus is visible, the dialog can be closed with Escape, and colour is never the only signal. |
| NFR-3 | **Responsiveness:** the layout works from a 360 px phone to a wide desktop. |
| NFR-4 | **Performance:** search and filtering update instantly for hundreds of assets. |
| NFR-5 | **Security:** user input is never rendered as HTML; input length is limited; dependencies have no known vulnerabilities. |
| NFR-6 | **Maintainability:** business logic lives in pure, tested functions so the data layer can be replaced by an API in Part 2. |
| NFR-7 | **Testability:** automated tests cover every functional requirement. |

## 7. User stories

1. As an IT admin, I want to register a new laptop with its serial number so that it can be tracked.
2. As an IT admin, I want to search for a person's name so that I can see every device they hold.
3. As an IT admin, I want to change a device's status to "Under repair" so that the team knows it is unavailable.
4. As an IT manager, I want to see warranties that end soon so that I can renew them or plan replacements.
5. As an IT admin, I want to delete a record that was entered by mistake, with a confirmation so that I don't delete the wrong one.

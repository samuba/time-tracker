# Time-Tracker

A tool to track the time you are spending on something eg. work, projects etc.
Login via OAUTH and use from mobile and desktop simultaneously.

[X] start/stop tracking via simple Button> click
[X] times are editable
[] show time per day
[] show time per week
[] show time per month

## Firestore Data Structure:
### Collections:

users: {
    id
    projects: [{
        projectName
        description
        pricePerHour
    }]
}

// the "big" data is chunked into month documents
// times is not a collection because it can be a lot of items and firestore is billed by read/write per document
months: {
    ownerId
    projectName
    year
    month
    times: [{ 
        start, 
        end
    }]
}
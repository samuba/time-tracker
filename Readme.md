# Trackerle

A cute little tool to help track the time you spend on something eg. working hours, private projects etc.

[X] start/stop tracking via simple Button> click
[X] times are editable
[X] show time per day
[X] Login via Google
[X] Login via Email
[X] Live updating from multiple devices
[X] edit start of current time period (for when you forgot to start tracking)
[] implement new firestore structure
[] show time per week
[] PWA
    - icon
    - full offline support
[] refine time editing
    - seperate controls for time and date
[] support more OAUTH Providers
[] show time per month
[] support time spanning multiple days
[] adding past time periods without start/stop (for when you forgot tracking at all)
[] do not use firebase development build (see console)

## Firestore Data Structure:

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
---
slug: availability-is-concurrency
title: Availability is a concurrency problem
project: Dacha
summary: A booking platform has one hard problem, and it is not the calendar UI. It is two people pressing the button at the same second.
status: draft
tags: [Node.js, MongoDB, Booking]
---

Dacha is a booking platform. People search dachas, open one, pick dates and
reserve it. Most of that is ordinary product work — search filters, a gallery,
a form. One part of it is not.

The hard part is that **availability is not data you read. It is a claim you
have to win.**

## The bug that every booking system starts with

The obvious implementation reads like the feature description:

```js
const clash = await Booking.findOne({
  property,
  from: { $lt: to },
  to:   { $gt: from },
})

if (clash) throw new Error('Those dates are taken')

await Booking.create({ property, from, to, user })
```

This is correct exactly as long as one person uses the site at a time.

Two requests can both run `findOne`, both find nothing, and both run `create`.
Neither did anything wrong. The gap between the check and the write is where
the second booking gets in. On a quiet site you may never see it. On the
weekend a listing gets shared, you will.

## Overlap is easier than it looks

Before fixing the race, get the comparison right, because this is the other
thing that is usually wrong.

Two ranges overlap when **each one starts before the other ends**:

```
existing.from < new.to   AND   existing.to > new.from
```

That is the whole rule. No special cases for "starts inside", "ends inside",
"completely contains" — those are all the same condition written four times.
If you find yourself writing four clauses, you are debugging the wrong thing.

Use strict comparisons on the boundaries so a checkout on the 10th and a
check-in on the 10th are not treated as a clash. Decide once whether a range
is half-open (`[from, to)`) and never write it the other way anywhere else.

## Making the database refuse

The fix is not a better check. It is to make the invalid state impossible to
store, so correctness does not depend on timing.

The strongest version is a constraint the database enforces. Postgres has
exclusion constraints, which is genuinely the right tool:

```sql
ALTER TABLE bookings ADD CONSTRAINT no_overlap
EXCLUDE USING gist (
  property_id WITH =,
  daterange(from_date, to_date, '[)') WITH &&
);
```

Now a conflicting insert fails. Not "usually". Always.

MongoDB has no equivalent, so you build it out of what it does have — a
transaction, or a unique key that represents the claim. Per-night documents
with a unique index on `(property, night)` turn "is this range free" into
"insert these nights, and let one of them fail":

```js
const session = await mongoose.startSession()
await session.withTransaction(async () => {
  await Night.insertMany(nights, { session, ordered: true })
  await Booking.create([{ property, from, to, user }], { session })
})
```

A duplicate key error is now the answer to "were those dates taken?" — and it
is the answer at the moment of writing, not a moment before it.

## What the client is allowed to know

The calendar in the browser is a **hint**. It is fetched, it is already stale,
and it exists to stop people trying dates that were clearly gone. It is not
permission.

So the server never trusts the dates it is handed. It re-derives the price
from the property and the range, checks the range is sane, and lets the
constraint decide. If the client could compute the total, the client could
also send a different one.

## The part worth keeping

Every product has one rule that must be true or the product is broken. Find
it early and push it as far down as it will go — into a constraint, into a
transaction, into the schema. Everything above that line gets to be ordinary
code that is allowed to be wrong occasionally.

For a booking platform, that rule is: **a night belongs to one booking.**

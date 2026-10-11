# Live Bus times

Live London bus arrivals from TfL open data.
Enter the 5-digit code from a bus stop sign to see what's arriving and when.

**[Live: ](https://live-bus-tfl.vercel.app/)**
HTML · CSS · JavaScript · Vercel



> Note: TfL currently has restrictions on it data and api. Stop at underground stations are most reliable - many other stops won't return data. Try on of these:
>
> `Highbury & Islington Station 77150` `Kilburn Park Station 56141` `Oxford Circus 52972`
>
>more here [`testStops.txt`](https://github.com/aaronAlien/Live-Bus-TFL/blob/main/testStops.txt).

## Why
On a short Data Science course i explored some TfL data with Python/Jupyter. That made me curious about building a version of something Londoners use everyday.

## Features
- Countdown arrivals (`308 to Wanstead | 3 min`), with direction and stop letter.
- Auto refresh every 30s, keeping the last times if a failure occurs.
- Accessibility labelled inputs, keyboard focus and screen reader announcements.

## Changes
- Rebuilt the app from React to plain JavaScript. Smaller bundle for a form and list.
- Utilised TfL's dedicated stop-code endpoint for accuracy.
- New unit tests with Vitest covering input, formatting, error handling and allowlist.

## Next
Search by bus number | Stops near me | Saved stops

---

_Powered by TfL Open Data Contains OS data © Crown copyright and database rights 2016' and Geomni UK Map data © and database rights [2019]_

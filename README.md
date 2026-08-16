# Grid Guardian

Build Prompt: GridGuardian

Build a polished, highly interactive web application called GridGuardian.

GridGuardian is a gamified environmental app that connects digital detox habits with real-time electricity-grid carbon intensity.

The core idea:

When the electricity grid is under higher carbon stress, GridGuardian encourages users to reduce unnecessary device usage and rewards them for doing so.

The experience should feel like a combination of a premium environmental dashboard + modern game + digital wellness app.

Do NOT make this look like a generic admin dashboard.

1. DESIGN DIRECTION

Create a beautiful, futuristic but clean interface.

Visual personality

Think:

premium climate-tech startup

futuristic city simulation

Apple-level cleanliness

subtle game mechanics

dark atmospheric background

glowing environmental accents

sophisticated rather than childish

interactive without being visually overwhelming

Color system

Primary background:

#07100D

#0B1512

#101B17

Primary accent:

electric mint / green

#63F5B0

Secondary accent:

cyan

#58D6FF

Warning:

amber

#FFC857

Critical:

red/coral

#FF6B6B

Use gradients and glow effects sparingly.

Cards should have:

subtle glass/transparent surfaces

thin borders

soft shadows

slight backdrop blur

generous spacing

rounded corners

Avoid excessive neon.

2. GLOBAL NAVIGATION

Create a persistent sidebar on desktop.

Navigation:

🌎 Overview
🛡️ Detox Shield
🏙️ Eco-City
📊 Impact
🏆 Challenges

Bottom:

⚙️ Settings
👤 Profile

On mobile, convert this into a bottom navigation bar.

Navigation transitions should be animated.

3. OVERVIEW / HOME SCREEN

This should be the main landing screen after login.

At the top:

Good evening, Guardian.

Subtitle:

The grid is changing. Your actions can change with it.

Then create a large interactive Grid Status Card.

Example:

GRID STATUS

347
gCO₂e/kWh

🟡 MODERATE STRESS

"Grid carbon intensity is currently elevated."

Show a horizontal intensity meter:

CLEAN ───── MODERATE ───── CRITICAL

Animate the current indicator.

Below it:

Grid intensity
↑ 12% compared with 1 hour ago

Best detox window
6:20 PM – 6:45 PM

Make this card feel alive.

The intensity number should subtly update/pulse when simulated live data changes.

4. REAL-TIME GRID VISUALIZATION

Create an interactive graph showing carbon intensity over the last several hours.

X-axis:
Time

Y-axis:
gCO₂e/kWh

The graph should clearly show:

historical intensity

current intensity

projected near-term intensity

clean/moderate/critical regions

Hovering over points should show:

6:15 PM
427 gCO₂e/kWh

Add a glowing vertical line indicating:

YOU ARE HERE

If actual API data is unavailable, create a realistic mock-data service that behaves like live data.

The architecture must make it easy to replace mock data with a real API later.

5. THE MAIN CTA

Make the central action extremely obvious.

Large card:

🛡️ DEPLOY DETOX SHIELD

The grid is under stress.

A 15-minute detox right now earns:

+180 Eco-Coins

3× Grid Bonus

Button:

ACTIVATE SHIELD →

When clicked, transition into the Detox Shield experience.

6. DETOX SHIELD SCREEN

This is the centerpiece of the application.

Create a visually impressive full-screen experience.

Center a large circular countdown:

14:32

Around it, create an animated shield ring.

Inside:

🛡️

GRID SHIELD ACTIVE

Below:

"Keep the shield alive."

Display:

Current grid intensity
427 gCO₂e/kWh

Current multiplier
3×

Potential reward
+180 Eco-Coins

7. DETOX INTERACTION

The timer must actually function.

Allow users to select:

5 minutes
10 minutes
15 minutes
30 minutes

When the timer starts:

begin countdown

animate the shield

update reward calculations

periodically update simulated grid intensity

calculate the current multiplier dynamically

If the user leaves the page:

Display an interruption state:

⚠️ SHIELD INTERRUPTED

"Your detox session was interrupted."

Give options:

Resume Shield
or
End Session

Do NOT pretend the browser can perfectly detect every form of phone usage. This is a web MVP, so treat leaving the page/tab as the detectable interruption.

When the timer reaches zero:

Create a satisfying completion animation.

SHIELD COMPLETE

15 minutes protected.

Then show:

+180 Eco-Coins
+45 Impact Points
3× Grid Bonus

Button:

RETURN TO MY CITY →

8. REWARD ENGINE

Implement real JavaScript/TypeScript logic.

Create a reward calculation function.

Base reward should depend on detox duration.

Example:

5 min → 40 coins
10 min → 90 coins
15 min → 150 coins
30 min → 350 coins

Then multiply based on grid intensity.

Grid multiplier:

< 200 → 1×

200–400 → 1.5×

400 → 3×

Also support a streak multiplier.

Example:

3-day streak → +10%
7-day streak → +20%
14-day streak → +35%

Show the user exactly how the reward was calculated.

Example:

150 base coins × 3.0 grid multiplier = 450 Eco-Coins

Do not hard-code the final reward into the UI.

9. ECO-CITY

Create a beautiful interactive miniature sustainable city.

This should NOT simply be a list of purchased items.

Create an actual visual city scene.

The city should contain:

buildings

roads

trees

solar panels

wind turbines

parks

clean-energy infrastructure

water features

Users spend Eco-Coins to upgrade their city.

Example:

SOLAR ARRAY

Cost: 100 Eco-Coins

"Generates clean energy for your city."

Button:

BUILD

When purchased:

deduct coins

animate construction

visually add the solar installation to the city

increase the city's Clean Energy score

Other buildings:

Wind Farm
Eco Transit Hub
Urban Forest
Water Recycling Plant
Green Tower
Clean Energy Storage

10. CITY INTERACTION

Make the city clickable.

Clicking an object should open a small information panel.

Example:

SOLAR ARRAY

Status:
ONLINE

Energy:
+18 Clean Energy

Impact:
-12 Pollution

Built:
Today

Allow users to rotate/zoom the city if practical.

If full 3D is unnecessary, create a highly polished 2D/isometric city instead.

Prioritize smooth interaction over technical complexity.

11. IMPACT PAGE

Create a personal environmental impact dashboard.

Show:

YOUR IMPACT

127
Detox Minutes

1,840
Eco-Coins Earned

14
Detox Sessions

8.7 kg
Estimated Avoided CO₂*

Add a small disclaimer:

"*Estimated using device-energy assumptions and the grid intensity observed during your sessions."

Create a beautiful impact graph.

Show:

detox minutes by day

grid intensity during detoxes

estimated avoided emissions

Also show:

YOUR BEST DETOX

August 15 · 6:42 PM

Grid intensity:
462 gCO₂e/kWh

Reward:
3×

Duration:
30 min

12. CHALLENGES

Create gamified environmental challenges.

Examples:

🔥 Beat the Peak

Complete 3 detoxes during high-carbon periods.

Reward:
+300 Eco-Coins

🌱 Green Streak

Detox for 7 consecutive days.

Reward:
Rare City Tree

⚡ Grid Guardian

Complete 10 total detox sessions.

Reward:
Exclusive infrastructure

Show progress bars.

Completed challenges should have satisfying animations.

13. PROFILE

Show:

Guardian Level
Current streak
Total Eco-Coins
City Level
Total Detox Minutes

Create a progression system:

Level 1 — Observer
Level 2 — Guardian
Level 3 — Protector
Level 4 — Grid Keeper
Level 5 — Earth Guardian

14. MICRO-INTERACTIONS

The application should feel extremely interactive.

Add:

smooth page transitions

hover animations

button press feedback

animated counters

progress animations

subtle particle effects

glowing grid indicators

reward confetti when appropriate

animated city construction

shield activation animation

graph hover interactions

toast notifications

skeleton loading states

Keep animations fast and elegant.

Do NOT make everything bounce or glow.

15. RESPONSIVE DESIGN

The entire application must work beautifully on:

desktop

tablet

mobile

On mobile:

sidebar becomes bottom navigation

cards become stacked

graphs remain readable

Detox Shield becomes full-screen

Eco-City adapts to smaller screens

16. DATA ARCHITECTURE

Separate the application into these logical services:

Grid Service

Responsible for:

fetching carbon intensity

storing current intensity

historical values

mock fallback data

Reward Engine

Responsible for:

duration calculation

grid multiplier

streak multiplier

Eco-Coin calculation

impact estimation

Detox Service

Responsible for:

session creation

countdown

interruption detection

completion

session history

City Service

Responsible for:

buildings

purchases

city upgrades

Eco-Coin spending

User Service

Responsible for:

profile

streak

level

statistics

Keep these concerns separated so the backend/API can be swapped later.

17. MOCK DATA

For the MVP, if a live grid API key is unavailable, use a simulated real-time dataset.

The mock service should:

update every 30–60 seconds

produce realistic fluctuations

sometimes cross the 200 and 400 thresholds

generate historical data

allow the UI to behave exactly as if it were receiving live data

Do not expose fake data as real-world data.

Clearly label the dashboard:

SIMULATED GRID DATA

when using the mock provider.

Create a clean abstraction so a real carbon-intensity API can later replace it.

18. TECHNICAL QUALITY

Build this as a real working application, not a static mockup.

Requirements:

reusable components

clean component hierarchy

responsive layout

proper state management

functional timers

functional reward calculations

persistent user state

functional city purchases

functional navigation

loading states

error states

accessible buttons and controls

Avoid unnecessary dependencies.

Do not build features that are impossible to demonstrate.

19. THE MOST IMPORTANT PRODUCT PRINCIPLE

The user should understand the entire concept within 10 seconds.

They should immediately see:

WHAT IS THE GRID DOING?

↓

WHEN SHOULD I DETOX?

↓

WHAT WILL I EARN?

↓

WHAT WILL MY CITY BECOME?

The app should constantly connect:

real-world grid → personal action → reward → virtual environmental impact

That connection is the heart of GridGuardian.

20. FINAL EXPERIENCE

The finished product should feel like a real startup prototype that could be shown to judges.

It should NOT look like:

a school project

a generic sustainability dashboard

a spreadsheet

a cryptocurrency app

a childish mobile game

an AI-generated template

It should feel like a polished climate-tech × digital-wellness × gaming product.

Prioritize:

Beautiful UI
→ Clear storytelling
→ Real interaction
→ Functional core loop
→ Scientific transparency

Build the MVP end-to-end and ensure the primary flow works:

Open app → see live/simulated grid → receive detox recommendation → activate shield → countdown → complete detox → earn Eco-Coins → upgrade city → view impact.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://grid-guardian-eco.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/f7f8cd39-b7be-4056-9e46-c5dd57a5265e).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

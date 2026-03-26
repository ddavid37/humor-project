# Week 9 User Testing Report — Daniel David

## User study: Gal Winter

### 1. User information
- Relationship: classmate
- Prior use of this app: none
- Experience with similar apps: other classmates tests

### 2. Observation context
- Location: in class
- Device: laptop
- Instructions given: I asked the user to sign in, then use the main page to (1) view the current caption, (2) vote using the upvote/downvote buttons, (3) go to the next caption, and (4) upload an image and click “Generate captions.”
- Tasks or free exploration: follow the UI controls in order (vote -> Next -> upload/select image -> Generate), then repeat the vote/Next once more.

### 3. Three things the user liked (functionality only)
1. The layout was clear: caption/voting was on the left and image upload/caption generation was on the right.
2. The vote buttons (“Upvote” and “Downvote”) were clearly labeled and easy to click.
3. The “Next” navigation changed the caption to a new one without breaking the page.

### 4. Three areas for improvement
1. It was not immediately obvious when the app would finish generating captions (user wanted clearer loading/“done” feedback).
2. The image upload area needed clearer guidance about what button to press (“Choose image” vs clicking the upload area).
3. The experience would improve if empty/error states were more specific (e.g., clearer message if captions/images fail to load).

### 5. Observed friction or confusion
- The user hesitated on the right panel at first, checking whether to click the upload area or the “+ Choose image” button.
- The user looked back at the right panel while waiting for the generated caption result.
- After moving to the next caption, the user briefly double-checked the caption/voting controls before clicking again.


### 6. Behavioral observations
- The user started by signing in, then immediately looked at the left caption and voting buttons.
- They clicked “Upvote,” then used “Next” to move to the next caption.
- They then focused on the right panel and uploaded/selected an image, clicked “Generate captions,” and waited for results.
- They repeated the vote + Next once after the generated step.


### 7. User quotes (optional)
- "It is super clean and straightforward."
- "I just waited until the generated caption appeared."

---

## User study: Daniel Baker


### 1. User information
- Relationship: classmate
- Prior use of this app: none
- Experience with similar apps: minimal

### 2. Observation context
- Location: in person
- Device: laptop
- Instructions given: I asked him to sign in, vote on the current caption, click `Next →`, then upload an image and click “Generate captions.”
- Tasks or free exploration: follow the UI flow once (vote + next, then upload + generate).

### 3. Three things the user liked (functionality only)
1. The left-panel actions (“Upvote/Downvote” and `Next`) were easy to locate.
2. The page updated to a new caption after clicking `Next →`.
3. The upload/generate area looked like a clear step flow once the image was selected.

### 4. Three areas for improvement
1. When uploading, it wasn’t obvious whether to click the upload box or the “+ Choose image” button.
2. The “upload/generate” state could be clearer about when the process is done.
3. After voting/next, the user would benefit from a clearer “current caption changed” cue.

### 5. Observed friction or confusion
- He paused briefly on the right panel to decide which upload control to use.
- He waited for the generated caption and checked the screen a couple times before continuing.

### 6. Behavioral observations
- He started on the left panel (vote buttons), then used `Next →`.
- After moving to the right panel, he selected an image and clicked “Generate captions.”
- He stayed engaged and followed the instructions without getting stuck.

### 7. User quotes (optional)
- “I got the voting and Next part right away.”
- “I just needed a second to figure out the upload button.”
- “Once it started, I was waiting for the captions to show up.”
---

## User study: Connor Whelan

### 1. User information
- Relationship: co-founder (very tech-savvy)
- Prior use of this app: none
- Experience with similar apps: extensive

### 2. Observation context
- Location: in person
- Device: laptop
- Instructions given: I asked him to sign in and then try the main flow (vote + Next, then upload an image and generate captions). No extra explanation beyond that.
- Tasks or free exploration: free exploration for 2–3 minutes, then repeat the generate captions step once.

### 3. Three things the user liked (functionality only)
1. The two-panel layout made it clear what the app expects (rate on the left, generate on the right).
2. The buttons were responsive and labels were understandable.
3. Errors/states (loading vs done) felt readable enough to continue.

### 4. Three areas for improvement
1. The app could make the upload action more explicit (one consistent call-to-action).
2. A small hint like “Select an image before Generate” would prevent hesitation.
3. It would help if the generated caption area were slightly more visually prominent when it appears.

### 5. Observed friction or confusion
- He briefly considered clicking the upload area itself before using the “+ Choose image” button.
- He asked where the latest generated caption would appear, then continued once it showed up.

### 6. Behavioral observations
- He clicked through the UI quickly and didn’t need much guidance.
- He generated captions, then immediately looked back at the caption area and voted/advanced.
- He repeated the generate flow once after finishing the first round.

### 7. User quotes (optional)
- “This layout makes sense—left is rating, right is generating.”
- “I almost clicked the box instead of the choose-image button.”
- “After I saw the caption appear, I knew what to do next.”
---

## Final summary (all three studies)
- What I learned from observing: Users understood the two-panel layout (rate on the left, generate on the right) and could complete the main flow, but they needed clearer guidance for the image-upload/generate step.
- What surprised me: Even tech-aware users still hesitated on *which* upload control to use and checked the UI multiple times while waiting for generation to finish.
- Patterns across users:
  - Left/right layout was easy to interpret.
  - The most common confusion was around uploading/selecting an image and knowing when generation is “done.”
  - After “Next,” users sometimes paused to confirm the caption/vote controls correspond to the new item.
- Improvements I plan to make (tied to observations):
  - Make the upload action more explicit with one clear primary CTA (reduce “click box vs choose button” hesitation).
  - Add clearer loading + completion feedback (e.g., stronger “Generating…” state and an obvious “Caption ready” moment).
  - When clicking `Next`, add a stronger visual cue that the caption/voting area updated (so users don’t re-check as much).
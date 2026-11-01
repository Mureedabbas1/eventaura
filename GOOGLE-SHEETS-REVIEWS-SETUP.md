# EventAura Google Sheets Reviews Setup

This gives EventAura a simple moderation workflow without Supabase. New reviews are saved as **Pending**; only rows changed to **Approved** appear publicly on the website.

## 1. Create the Google Sheet
1. Sign in to the Google account that should receive and manage reviews.
2. Create a blank Google Sheet named **EventAura Customer Reviews**.
3. Open **Extensions → Apps Script**.
4. Replace the starter code in the editor with the complete code from `google-apps-script/reviews.gs`.
5. Save the project as **EventAura Reviews**.
6. In the function selector, choose `setupReviewsSheet` and click **Run**. Review and grant Google's requested permissions. This creates the Reviews tab and its column headings.

## 2. Deploy the review API
1. In Apps Script click **Deploy → New deployment**.
2. Select the gear icon / deployment type **Web app**.
3. Set **Execute as: Me**.
4. Set **Who has access: Anyone** (the public website must be able to submit and read approved reviews).
5. Click **Deploy**, authorize if asked, and copy the Web app URL. It should end in `/exec`.

## 3. Connect the website
1. Open `index.html` in the EventAura GitHub repository.
2. Find `PASTE_YOUR_APPS_SCRIPT_WEB_APP_URL_HERE`.
3. Replace that exact text with the Web app URL you copied. Keep the single quotes around the URL.
4. Commit the change. GitHub Pages will publish it automatically.

## 4. Approve reviews
1. Open the **EventAura Customer Reviews** Google Sheet.
2. Each new customer review appears in the **Reviews** tab with Status **Pending**.
3. Check the name, rating and comment. Change that row's Status cell (column F) to exactly **Approved**.
4. The approved review will then appear in the Reviews section on the website. Leave it as Pending to keep it private; delete the row to remove it.

## Important
- Do not share the spreadsheet with the public. Only the Apps Script Web App is public.
- Anyone with the Web App URL can submit a review; the website displays only rows marked Approved.
- The first-time Apps Script deployment and Google authorization must be completed by you while signed in to your Google account. I cannot authorize or deploy it inside your account.
- If you edit the Apps Script later, use **Deploy → Manage deployments → Edit → New version → Deploy**.

# 💜 Two-Month Anniversary Web Application

A beautiful, interactive web experience created to celebrate two months of intentional love with Ayomide.

## 🎉 What's Inside

This project contains **4 interconnected web applications**, each designed to express love in a unique way:

### 1. **Landing Page** (`anniversary-landing.html`)
The main entrance to the anniversary experience featuring:
- Animated gradient background
- Floating hearts animation
- Beautiful glass-morphism cards
- Ambient music control
- Links to all three experiences

### 2. **The Promise Vault** (`promise-vault.html`)
An interactive vault of 40+ heartfelt promises:
- Click to reveal random promises
- Sound effects on each unlock
- Heart particle animations
- Promise counter
- Keyboard shortcuts (Space/Enter)

**Sample Promises:**
- "You are my steady part, the calm in every storm"
- "You are my Firelighter — the spark that ignites my purpose"
- "I choose you intentionally, not by chance, but by design"
- And 37 more deeply personal commitments!

### 3. **Our Destiny Timeline** (`timeline.html`)
A beautiful vertical timeline showing your relationship journey:
- Animated entrance for each milestone
- 5 key moments from first message to forever
- Ambient music with chord progressions
- Emphasizes intentionality at every step
- Mobile-optimized responsive design

**Timeline Includes:**
1. The First Message (Early September)
2. Late Night Revelations (Mid September)
3. The Intentional Choice (Late September)
4. We Became Official (October 8, 2025) ⭐
5. Today & Forever (Now - Infinity)

### 4. **Counting Every Moment** (`countdown.html`)
A live counter showing time since becoming official:
- Real-time updates every second
- Days, Hours, Minutes, Seconds display
- Total seconds counter
- Tick sound effects
- Sparkle animations
- Ambient music

## 🎨 Design Features

All pages include:
- ✅ **Responsive Design** - Works perfectly on mobile, tablet, and desktop
- ✅ **Beautiful Animations** - Fade-ins, particles, gradients, floating elements
- ✅ **Web Audio API** - Ambient music and sound effects (no external files needed)
- ✅ **Glass Morphism** - Modern translucent card designs
- ✅ **Custom Fonts** - Inter, Playfair Display, Dancing Script
- ✅ **Zero Dependencies** - Only Tailwind CSS CDN
- ✅ **Single File Apps** - Easy to share and host

## 🚀 How to Use

### Option 1: Open Directly in Browser
Simply double-click any HTML file:
- `anniversary-landing.html` - Start here!
- `promise-vault.html`
- `timeline.html`
- `countdown.html`

### Option 2: Local Server (Recommended)
For best performance and to avoid any browser restrictions:

```bash
# Navigate to the project folder
cd c:\Users\Adesoji\Desktop\Ayomide

# Start a simple HTTP server (Python 3)
python -m http.server 8000

# Or if you have Node.js installed
npx http-server -p 8000
```

Then open in your browser:
- **Main Landing**: http://localhost:8000/anniversary-landing.html
- Promise Vault: http://localhost:8000/promise-vault.html
- Timeline: http://localhost:8000/timeline.html
- Countdown: http://localhost:8000/countdown.html

### Option 3: Deploy Online (Free Options)

#### GitHub Pages:
```bash
# Create a new repository on GitHub
# Push your files
git init
git add anniversary-landing.html promise-vault.html timeline.html countdown.html
git commit -m "Anniversary site"
git branch -M main
git remote add origin https://github.com/yourusername/anniversary.git
git push -u origin main

# Enable GitHub Pages in repository settings
# Your site will be live at: https://yourusername.github.io/anniversary/anniversary-landing.html
```

#### Netlify Drop:
1. Go to https://app.netlify.com/drop
2. Drag and drop all 4 HTML files
3. Get instant live URL!

#### Vercel:
```bash
npm i -g vercel
vercel
```

## 🎵 Music & Sound Effects

All audio is generated using the **Web Audio API**:
- **Ambient Music**: Soothing sine wave harmonies (A major chord progressions)
- **Unlock Sound**: Promise Vault unlock effect
- **Tick Sound**: Countdown second-by-second pulse

**Note**: Browsers require user interaction to play audio. Click the music button to start!

## 📱 Features by Page

### Landing Page
- Floating hearts background (7 different heart emojis)
- Glass-morphism cards with hover effects
- Ambient music toggle button
- Smooth gradient animations
- Responsive grid layout

### Promise Vault
- 40 unique, deeply personal promises
- Random promise selection (no immediate repeats)
- Sound effect on each reveal
- Heart particle burst animation
- Promise counter
- Keyboard shortcuts

### Timeline
- 5 milestone events with dates
- Staggered fade-in animations
- Alternating left/right layout (desktop)
- Linear layout (mobile)
- Ambient chord progression music
- Back to home button

### Countdown
- Real-time counter (updates every second)
- Days, Hours, Minutes, Seconds breakdown
- Total seconds display with comma formatting
- Sparkle particle effects
- Tick sound on each second
- Pulsing glow effects

## 🎨 Color Palette

- **Primary Purple**: `#667eea`, `#764ba2`, `#9333ea`
- **Primary Pink**: `#f093fb`, `#f5576c`, `#e73c7e`
- **Accent Gradients**: Purple → Pink transitions
- **Background**: Animated multi-color gradients
- **Text**: Gray scale for optimal readability

## 💡 Customization Tips

### Site configuration (easy month/year updates)
Centralize date and feature toggles in `site-config.json` at the repository root. The shared scripts load this file automatically (via `js/config-loader.js`). Update the keys below to change the celebration date, start date, theme default, and audio settings without editing multiple pages.

Example `site-config.json` schema:

```json
{
    "siteName": "Ayomide Anniversary",
    "startDate": "2025-09-08",
    "celebrationDate": "2025-11-08",
    "months": 2,
    "durationDays": 61,
    "useSoundCloud": true,
    "soundCloudTrackUrl": "https://api.soundcloud.com/tracks/2019893204",
    "localAudioPath": "/audio/track.mp3",
    "themeDefault": "light",
    "secretNoteCode": "MIDELOVE"
}
```

How it works:
- Add or update `site-config.json` in the project root.
- `js/config-loader.js` fetches it at runtime and exposes `window.SITE_CONFIG` and `window.SITE_CONFIG_READY` (a Promise).
- Shared scripts (`js/music.js`, `js/theme.js`, `js/notes.js`) and pages read the config automatically, so you only need to update this file for month/year changes.

If you prefer to hard-code dates in a single page (not recommended), update `pages/countdown.html`'s `anniversaryDate` value. Using `site-config.json` is the preferred, maintainable approach.

### Add More Promises:
Edit the `promises` array in `promise-vault.html`:
```javascript
const promises = [
    "Your new promise here",
    // ... add as many as you want
];
```

### Adjust Music:
Modify the frequencies in each page's audio script:
```javascript
const notes = [220, 329.63, 440, 554.37]; // Change these frequencies
```

### Change Colors:
Update Tailwind classes or add custom CSS:
```css
background: linear-gradient(135deg, #yourcolor1, #yourcolor2);
```

## 📝 Technical Details

- **Framework**: Vanilla JavaScript (no dependencies)
- **Styling**: Tailwind CSS v3 (CDN)
- **Fonts**: Google Fonts (Inter, Playfair Display, Dancing Script)
- **Audio**: Web Audio API (no external files)
- **Animations**: CSS Keyframes + JavaScript
- **Browser Support**: Modern browsers (Chrome, Firefox, Safari, Edge)

## 🔧 Troubleshooting

**Music not playing?**
- Click the music button (browsers block autoplay)
- Check browser console for errors
- Try using a local server instead of opening files directly

**Animations laggy?**
- Close other browser tabs
- The apps limit particle counts to prevent performance issues
- Use Chrome or Edge for best performance

**Mobile issues?**
- All pages are fully responsive
- Test on actual device, not just browser dev tools
- Some animations are optimized for mobile

## 💝 Message to Ayomide

This entire web experience was crafted with intentionality, love, and dedication. Each page, each animation, each word was chosen carefully to express how deeply you're valued.

**You are:**
- My steady part
- My Firelighter
- My vision
- My future
- My forever

Distance is temporary. My devotion is eternal.

Happy Two-Month Anniversary, My Love 💜

---

**Created with endless love**  
November 8, 2025

## 📄 License

This is a personal gift. Feel free to use the code structure for your own projects, but the content is deeply personal and specific to this relationship.

---

## 🎁 Bonus: Sharing Tips

**For Maximum Impact:**
1. Send her the landing page link first
2. Let her explore at her own pace
3. Each experience takes 2-5 minutes
4. Best viewed on desktop but works on mobile
5. Turn on sound for the full experience!

**Suggested Message:**
> "I made something for you. It's not perfect, but it's from the heart. Start here: [your-link]. Take your time with it. Every word is intentional. Every detail matters. Just like you. 💜"

import { flywheelTools, tldrPageData } from './lib/content';

const actualCount = flywheelTools.length;
const claimedCount = parseInt(tldrPageData.hero.stats.find(s => s.label === "Ecosystem Tools")?.value || "0");

console.log(`Actual tools: ${actualCount}`);
console.log(`Claimed tools: ${claimedCount}`);

if (actualCount !== claimedCount) {
  console.error("MISMATCH! Please update tldrPageData in lib/content.ts");
  process.exit(1);
} else {
  console.log("Tool counts match.");
}

/**
 * AI tool comparison data for /ai-tools.
 * This is the ONLY file the monthly refresh task edits.
 * Every price comes from the maker's own page, read on LAST_CHECKED.
 * Never add a price that was not read on a maker page that day; write "not checked" instead.
 */

export const LAST_CHECKED = '2026-10-29';
export const LAST_CHECKED_LABEL = '29 October 2026';

export interface PriceRow {
  tool: string;
  plan: string;
  usdYearly: string;
  usdMonthly: string;
  inr: string;
  seats: string;
}

export const priceRows: PriceRow[] = [
  { tool: 'Claude', plan: 'Team, standard seat', usdYearly: '20', usdMonthly: '25', inr: 'Not shown in rupees on maker page', seats: '2 to 150' },
  { tool: 'Claude', plan: 'Team, premium seat', usdYearly: '100', usdMonthly: '125', inr: 'Not shown in rupees on maker page', seats: '2 to 150' },
  { tool: 'Claude', plan: 'Enterprise', usdYearly: '20 plus usage at API rates', usdMonthly: 'Not offered', inr: 'Not shown in rupees on maker page', seats: '20 minimum' },
  { tool: 'ChatGPT', plan: 'Business, standard seat', usdYearly: '20', usdMonthly: '25', inr: 'Not shown in rupees on maker page', seats: '2 or more' },
  { tool: 'ChatGPT', plan: 'Business, premium seat', usdYearly: '100', usdMonthly: '125', inr: 'Not shown in rupees on maker page', seats: '2 or more' },
  { tool: 'ChatGPT', plan: 'Enterprise', usdYearly: 'Contact sales', usdMonthly: 'Contact sales', inr: 'Contact sales', seats: 'Not stated' },
  { tool: 'Gemini', plan: 'Workspace Business Starter', usdYearly: '7', usdMonthly: '8.40', inr: '270 yearly', seats: 'Up to 300' },
  { tool: 'Gemini', plan: 'Workspace Business Standard', usdYearly: '14', usdMonthly: '16.80', inr: '1,080 yearly (864 on offer)', seats: 'Up to 300' },
  { tool: 'Gemini', plan: 'Workspace Business Plus', usdYearly: '22', usdMonthly: '26.40', inr: 'Plan not shown on India page', seats: 'Up to 300' },
  { tool: 'Microsoft Copilot', plan: 'Copilot Business add-on', usdYearly: '18 (first-year offer, normally 21)', usdMonthly: '25.20', inr: '1,495.73 yearly offer (normally 1,745), 2,094 monthly', seats: 'Not stated' },
  { tool: 'Microsoft Copilot', plan: 'Business Standard with Copilot', usdYearly: '23.50', usdMonthly: '28.20', inr: '1,955 yearly, 2,346 monthly', seats: 'Up to 300' },
  { tool: 'Microsoft Copilot', plan: 'Business Premium with Copilot', usdYearly: '32', usdMonthly: '38.40', inr: '2,660 yearly, 3,192 monthly', seats: 'Up to 300' },
];

/** Short notes shown under the price table. */
export const priceNotes: string[] = [
  'Prices are per person per month, before tax. Rupee prices are before GST.',
  "Google's India page shows rupees. The Claude and ChatGPT pages showed US dollars only, so their rupee price is whatever the checkout shows.",
  "Google's price covers the whole Workspace suite, so a firm already on Workspace isn't paying twice.",
  "Microsoft's add-on offer runs until 31 December 2026, for firms that already have an eligible Microsoft 365 Business plan.",
];

/** One paragraph on data rules for business plans. */
export const dataRules =
  "All four makers say in writing that their business plans don't use company data to train their models. The personal plans of Claude and ChatGPT work the other way: training stays on until the user switches it off. So the cheapest data fix in most small firms costs nothing. Staff stop using personal accounts for company work.";

/** Limits the price does not show. */
export const limits =
  'Claude counts use in five-hour windows with a weekly limit on top. Gemini works inside Docs, Sheets and Meet only from Business Standard upward. Microsoft bills some advanced features by usage on top of the seat, and Claude Enterprise bills all usage that way.';

export interface Source {
  label: string;
  url: string;
}

export const sources: Source[] = [
  { label: 'Claude pricing', url: 'https://claude.com/pricing' },
  { label: 'ChatGPT pricing', url: 'https://chatgpt.com/pricing' },
  { label: 'ChatGPT Business premium seats', url: 'https://openai.com/index/premium-seats-chatgpt-business' },
  { label: 'Google Workspace pricing', url: 'https://workspace.google.com/pricing' },
  { label: 'Google Workspace pricing, India', url: 'https://workspace.google.com/pricing?hl=en_in' },
  { label: 'Microsoft 365 Copilot Business', url: 'https://www.microsoft.com/en-us/microsoft-365/copilot/business' },
  { label: 'Microsoft 365 Copilot pricing, India', url: 'https://www.microsoft.com/en-in/microsoft-365-copilot/pricing' },
];

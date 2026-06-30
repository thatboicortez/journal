# Trading Journal

Static screenshot-friendly trading journal page.

## How to edit trades

Open `app.js` and edit the `trades` array:

```js
{
  date: "22.10.2025 - 28.10.2025",
  pair: "GBPUSD",
  direction: "Long",
  rr: -1,
  costs: { swap: 0.03, commission: 0.04, slippage: 0 },
}
```

- `direction` should be `Long` or `Short`.
- `rr` is the trade RR.
- `costs` are entered as positive RR costs. The page displays them as negative values.

## Pair images

Put images into `assets/pairs` with lowercase names:

- `eurusd.png`
- `gbpusd.png`
- `ger40.png`
- `xauusd.png`

If an image is missing, the page shows a fallback badge.

## Trader photo

Put the trader profile photo at `assets/trader/trademark830am.png`.
The page will show a fallback avatar if the photo is missing.

## Open

Open `index.html` in a browser and take a screenshot.

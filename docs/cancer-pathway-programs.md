# ONCOSMART cancer pathway programs

Source tables: [`oncosmart-cancer-pathway-tables.png`](./oncosmart-cancer-pathway-tables.png)

Encoded in [`data/cancer-pathway-programs.json`](../data/cancer-pathway-programs.json).

## Rules

| Level | Reps | Sequence |
|------:|-----:|----------|
| 1 | 5 × 1 | Level 1 list |
| 2 | 5 × 1 | Level 2 list |
| 3 | 10 × 1 | **Same as Level 2** |
| 4 | 15 × 1 | **Same as Level 2** |

Left/right storage clips for one diagram step (e.g. Wall Climbing) play as **two consecutive steps**.

## Runtime

1. Load MP4s for `{Gender} - {Language}/{Cancer}/Level N`
2. Match files to the diagram sequence (slug + aliases)
3. If a table step has no file in that folder, use the same exercise from another cancer folder at the same gender, language, and level
4. Leave out storage files that are not in the table
5. Show filename reps when present; otherwise level defaults (5 / 5 / 10 / 15)

## Storage notes

- **Breast / Thorax:** storage order matches the tables (with L/R expansion).
- **Abdomen Level 2** follows the table: Standing Hamstring Curls, Calf Raise, then Straight Leg Raise.
- **Head & Neck:** Ankle Pumps files in that folder are not part of the table and are not shown. Thoracic Expansion is taken from the same gender and language when the Head & Neck folder does not include it. Arm Rotation uses the Arm Circles clip.

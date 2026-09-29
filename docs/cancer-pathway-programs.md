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
3. Append any unmatched storage clips at the end
4. Show filename reps when present; otherwise level defaults (5 / 5 / 10 / 15)

## Storage notes

- **Breast / Thorax:** storage order matches the tables (with L/R expansion).
- **Abdomen:** Arm Rotation in the table is satisfied by Arm Circles videos; an extra Hamstring Curls pair may appear after the program if present in storage.
- **Head & Neck (proposed):** storage currently has Ankle Pumps and Arm Circles instead of Thoracic Expansion / Arm Rotation. Sessions follow the table where videos exist; extras append at the end until storage is updated.

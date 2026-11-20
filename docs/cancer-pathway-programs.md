# ONCOSMART cancer pathway programs

Source tables: [`oncosmart-cancer-pathway-tables.png`](./oncosmart-cancer-pathway-tables.png)

Encoded in [`data/cancer-pathway-programs.json`](../data/cancer-pathway-programs.json).

## Rules

| Level | Counted reps | Sequence |
|------:|-------------:|----------|
| 1 | 5 × 1 | That level's list. Dashed sheet cells are omitted. |
| 2 | 5 × 1 | That level's list |
| 3 | 10 × 1 | That level's list |
| 4 | 15 × 1 | That level's list |

Incentive spirometer is 10, 10, 15, 15. Pelvic bridge at Level 4 is 10 reps, one side. Stretches are 30 seconds. Spot marching is 1 minute. The sheet dose is shown even when an older filename prints a different count. The old video file is still the one that plays.

Left/right storage clips for one diagram step (e.g. Wall Climbing) play as **two consecutive steps**.

## Runtime

1. Load the existing MP4s for `{Gender} - {Language}/{Cancer}/Level N`
2. Load new exercises from `Newly added {Gender}/{Gender} ({language}) - newly added/Level N`
3. Match files to this level's list. When the new folder has that exercise, it replaces the old video: hamstring stretch (chair, left and right) and neck flexion. Breast Level 1 arm circles use the short-lever clip. Abdomen Level 4 pelvic bridge uses the unilateral clip. Head & Neck Level 1 neck rotation uses the 1st-level clip.
4. If the new folder has no clip, use the old file from the same cancer, then another cancer at this gender and language
5. Leave out storage files that are not on the sheet for that level

## Storage notes

- Old clips stay in the cancer folders. New clips stay in `Newly added Female` and `Newly added Male`.
- **Head & Neck:** Ankle Pumps files in that folder are not part of the list and are not shown. Thoracic Expansion is taken from the same gender and language when the Head & Neck folder does not include it. Arm Rotation uses the existing Arm Circles clip.
- Female English Level 4 has no Neck Rotation file. That step uses the Female English Level 3 Neck Rotation clip and still shows 15 reps.

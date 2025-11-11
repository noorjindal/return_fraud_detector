## Research Papers Mapping: Links and Project Usage

This document lists each referenced work with a link and what we use from it (or plan to), aligned to the current implementation.

| Area | Paper | Link | What we use in this project | Status |
|------|-------|------|------------------------------|--------|
| Core modeling (GBDT) | LightGBM: A Highly Efficient Gradient Boosting Decision Tree | https://papers.nips.cc/paper_files/paper/2017/hash/6449f44a102fde848669bdd9eb6b76fa-Abstract.html | Main classifier for training and inference; parameters for tabular fraud; early stopping and feature importance | Used |
| Explainability | SHAP: A Unified Approach to Interpreting Model Predictions | https://papers.nips.cc/paper_files/paper/2017/hash/8a20a8621978632d76c43dfd28b67767-Abstract.html | Per-request explanation via top contributing features; global feature importance displayed via metrics endpoint | Used |
| Explainability (trees) | Consistent Individualized Feature Attribution for Tree Ensembles (TreeSHAP) | https://arxiv.org/abs/1905.04610 | Fast, consistent SHAP attributions for LightGBM; informs how we compute and present risk factors | Used |
| Imbalanced learning | SMOTE: Synthetic Minority Over-sampling Technique | https://www.jair.org/index.php/jair/article/view/10302 | Considered for training data balancing; complements class weighting | Planned (optional) |
| Imbalanced learning | Borderline-SMOTE | https://ieeexplore.ieee.org/document/1540124 | Alternative targeted oversampling near decision boundary | Planned (optional) |
| Imbalance surveys | Learning from Imbalanced Data (Survey) | https://ieeexplore.ieee.org/document/5128907 | Guidance on metrics and protocols; we use PR-AUC, F1, stratified splits | Used (guidance) |
| Imbalance surveys | A Systematic Review of Class Imbalance Learning | https://www.sciencedirect.com/science/article/pii/S1566253518304627 | Confirms choice of PR-AUC, stratified CV, class weighting | Used (guidance) |
| Hard-example emphasis | Focal Loss for Dense Detection | https://ieeexplore.ieee.org/document/8237586 | Idea to prioritize hard cases; proxy via class weights/threshold tuning | Planned (concept) |
| Cost-sensitive learning | Cost-Sensitive Learning for Imbalanced Classification (Survey) | https://dl.acm.org/doi/10.1145/3439729 | Business-aware thresholding; class weights (`is_unbalance=True` in LightGBM) | Used (partial) |
| Concept drift | A Survey on Concept Drift Adaptation | https://dl.acm.org/doi/10.1145/2523813 | Informs need for drift monitoring and retraining triggers | Planned |
| Concept drift | Learning under Concept Drift: A Review | https://ieeexplore.ieee.org/document/7805225 | Strategies for detecting/handling drift in production | Planned |
| Human-in-the-loop | Active Learning Literature Survey | https://www.cs.cornell.edu/~alexn/papers/active_learning_survey_2009.pdf | Guides reviewer loop and selective labeling from manual review | Planned |
| Human-in-the-loop (streams) | Active learning for anomaly/fraud in streams (representative) | https://dl.acm.org/doi/10.1145/3137597.3137600 | Online selection strategies aligned with fraud streams | Planned |
| Graph-based fraud | EnsemFDet: Ensemble Fraud Detection on Bipartite Graphs (JD.com) | https://arxiv.org/abs/1912.11113 | Motivates device-email-address-user graph features and scalable graph heuristics | Planned |
| GNNs for fraud | Graph Neural Networks for Fraud Detection: A Survey | https://dl.acm.org/doi/10.1145/3571142 | Roadmap for augmenting with GNN features or hybrid GBDT+GNN | Planned |

### Notes on current implementation
- LightGBM is configured with imbalance handling (`is_unbalance=True`) and stratified splits; we monitor ROC-AUC and PR-AUC and expose feature importances.
- SHAP/TreeSHAP is surfaced as top risk factors per prediction and as global importance via `/metrics`.
- SMOTE/Borderline-SMOTE and focal/cost-sensitive variants are not mandatory given synthetic data, but are advisable for real datasets with severe skew.
- Concept drift, human-in-the-loop active learning, and graph-based modeling are planned extensions for production scenarios.

### Trace to repository
- Training: `src/models/train_model.py` (LightGBM, metrics, SHAP hooks)
- Inference/API: `src/api/app.py` (feature order, scoring, top risk factors, metrics endpoints)
- Frontend: `frontend/src/components/FraudScorer.js` (per-request scoring UI), `frontend/src/components/Dashboard.js` (health/metrics)



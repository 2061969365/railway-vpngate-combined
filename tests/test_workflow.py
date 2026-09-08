"""Workflow contract tests: trial-run job must exist; no Railway deploy job."""
from __future__ import annotations

import unittest
from pathlib import Path

WORKFLOW = Path(__file__).resolve().parent.parent / ".github" / "workflows" / "test-combined.yml"


class TrialRunJobTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.text = WORKFLOW.read_text(encoding="utf-8")

    def test_trial_run_job_exists(self) -> None:
        self.assertIn("trial-run:", self.text)

    def test_trial_run_needs_railway_build(self) -> None:
        self.assertIn("needs: railway-build", self.text)

    def test_trial_run_does_real_dial(self) -> None:
        self.assertIn("REAL_TOPK=2", self.text)

    def test_trial_run_checks_exit_ip_via_proxy(self) -> None:
        self.assertIn("socks5h", self.text)
        self.assertIn("api.ipify.org", self.text)

    def test_trial_run_exercises_full_probe(self) -> None:
        self.assertIn("full_probe", self.text)

    def test_trial_run_exercises_single_probe(self) -> None:
        self.assertIn("/api/probe", self.text)

    def test_trial_run_verifies_dual_vless_paths(self) -> None:
        self.assertIn("/ws-node", self.text)
        self.assertIn("/ws-chain", self.text)
        self.assertIn("vless", self.text)

    def test_trial_run_chain_exit_differs_direct_exit_matches(self) -> None:
        self.assertIn("8082", self.text)
        self.assertIn("DIRECT_IP", self.text)

    def test_ws_upgrade_check_tolerates_hanging_connection(self) -> None:
        # sing-box answers 101 then waits for the VLESS payload, so curl
        # always times out (exit 28) even on success; under `bash -e` that
        # would kill the step before the 101 assertion runs.
        start = self.text.index("ws_code() {")
        block = self.text[start:start + 800]
        self.assertIn("|| true", block)

    def test_smoke_uses_non_colliding_port(self) -> None:
        # start.sh always enables VLESS (default UUID), so $PORT must avoid
        # the fixed 8080/8081/8082/4096 ports or sing-box fails to bind.
        self.assertIn("-e PORT=3000", self.text)

    def test_no_railway_deploy_job(self) -> None:
        self.assertNotIn("deploy-railway:", self.text)

    def test_smoke_asserts_dual_disguise_links(self) -> None:
        self.assertIn("nodeLinkChain", self.text)
        self.assertIn("ws-chain", self.text)


PUBLISH_WORKFLOW = Path(__file__).resolve().parent.parent / ".github" / "workflows" / "publish-image.yml"


class PublishImageTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.text = PUBLISH_WORKFLOW.read_text(encoding="utf-8")

    def test_publishes_to_ghcr(self) -> None:
        self.assertIn("ghcr.io", self.text)

    def test_builds_repo_dockerfile(self) -> None:
        self.assertIn("Dockerfile", self.text)

    def test_pushes_only_on_main(self) -> None:
        self.assertIn("main", self.text)
        self.assertIn("push", self.text)

    def test_has_packages_write_permission(self) -> None:
        self.assertIn("packages: write", self.text)


if __name__ == "__main__":
    unittest.main()

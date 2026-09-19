"""Tests for scripts/verify_dualpin.py (auto dual-pin CI verification)."""
import importlib.util
import unittest
from pathlib import Path

SCRIPT = Path(__file__).resolve().parent.parent / "scripts" / "verify_dualpin.py"


def load_module():
    spec = importlib.util.spec_from_file_location("verify_dualpin", SCRIPT)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def endpoint(tag, real):
    return {"tag": tag, "server": "10.0.0.1", "server_port": 443,
            "real_latency_ms": real}


def config(chain_outbounds, final="chain"):
    return {"route": {"final": final},
            "outbounds": [{"type": "selector", "tag": "chain",
                           "outbounds": chain_outbounds}]}


class VerifyTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.mod = load_module()

    def test_pass_dual(self) -> None:
        status = {"preferred_tag": "vpngate-1", "backup_tag": "vpngate-2",
                  "endpoints": [endpoint("vpngate-0", 70),
                                endpoint("vpngate-1", 30),
                                endpoint("vpngate-2", 50)]}

        code, markdown = self.mod.run(
            status, config(["vpngate-1", "vpngate-2", "auto"]))

        self.assertEqual(0, code)
        self.assertIn("vpngate-1", markdown)
        self.assertIn("vpngate-2", markdown)

    def test_pass_single(self) -> None:
        status = {"preferred_tag": "vpngate-0", "backup_tag": None,
                  "endpoints": [endpoint("vpngate-0", 40),
                                endpoint("vpngate-1", None)]}

        code, _ = self.mod.run(status, config(["vpngate-0", "auto"]))

        self.assertEqual(0, code)

    def test_wrong_pin_fails(self) -> None:
        status = {"preferred_tag": "vpngate-0", "backup_tag": None,
                  "endpoints": [endpoint("vpngate-0", 70),
                                endpoint("vpngate-1", 30)]}

        code, markdown = self.mod.run(
            status, config(["vpngate-0", "auto"]))

        self.assertEqual(1, code)
        self.assertIn("vpngate-1", markdown)

    def test_chain_mismatch_fails(self) -> None:
        status = {"preferred_tag": "vpngate-1", "backup_tag": "vpngate-2",
                  "endpoints": [endpoint("vpngate-0", 70),
                                endpoint("vpngate-1", 30),
                                endpoint("vpngate-2", 50)]}

        code, _ = self.mod.run(status, config(["vpngate-1", "auto"]))

        self.assertEqual(1, code)

    def test_no_measured_fails(self) -> None:
        status = {"preferred_tag": None, "backup_tag": None,
                  "endpoints": [endpoint("vpngate-0", None)]}

        code, _ = self.mod.run(status, config(["auto"], final="auto"))

        self.assertEqual(1, code)

    def test_main_missing_files(self) -> None:
        code = self.mod.main(["--status", "/nonexistent-status.json",
                              "--config", "/nonexistent-config.json"])

        self.assertEqual(1, code)

    def test_exit_skip_defers_to_next_with_exit(self) -> None:
        """vpngate-1 measured best but has no exit IP (event says so):
        best defers to vpngate-2, backup to vpngate-0."""
        status = {"preferred_tag": "vpngate-2", "backup_tag": "vpngate-0",
                  "endpoints": [endpoint("vpngate-0", 70),
                                endpoint("vpngate-1", 30),
                                endpoint("vpngate-2", 50)],
                  "refresh_history": [
                      {"event": "auto-pin-exit-skip",
                       "detail": "vpngate-1 has no exit ip, pinned vpngate-2"}]}

        code, markdown = self.mod.run(
            status, config(["vpngate-2", "vpngate-0", "auto"]))

        self.assertEqual(0, code)
        self.assertIn("vpngate-2", markdown)

    def test_exit_skip_second_defers_backup(self) -> None:
        """vpngate-2 measured second but has no exit IP: backup may be
        vpngate-0 (third measured)."""
        status = {"preferred_tag": "vpngate-1", "backup_tag": "vpngate-0",
                  "endpoints": [endpoint("vpngate-0", 70),
                                endpoint("vpngate-1", 30),
                                endpoint("vpngate-2", 50)],
                  "refresh_history": [
                      {"event": "auto-pin-exit-skip",
                       "detail": "vpngate-2 has no exit ip, pinned vpngate-1"}]}

        code, _ = self.mod.run(
            status, config(["vpngate-1", "vpngate-0", "auto"]))

        self.assertEqual(0, code)

    def test_exit_skip_contradiction_still_fails(self) -> None:
        """Event claims vpngate-1 skipped, but serving pins vpngate-1:
        events can only defer, never cover a contradiction."""
        status = {"preferred_tag": "vpngate-1", "backup_tag": "vpngate-2",
                  "endpoints": [endpoint("vpngate-0", 70),
                                endpoint("vpngate-1", 30),
                                endpoint("vpngate-2", 50)],
                  "refresh_history": [
                      {"event": "auto-pin-exit-skip",
                       "detail": "vpngate-1 has no exit ip, pinned vpngate-0"}]}

        code, _ = self.mod.run(
            status, config(["vpngate-1", "vpngate-2", "auto"]))

        self.assertEqual(1, code)

    def test_no_event_falls_back_to_strict_ranking(self) -> None:
        """No exit-skip events (old snapshot / truncated history):
        strict measured ranking, backup must be the measured second."""
        status = {"preferred_tag": "vpngate-0", "backup_tag": "vpngate-2",
                  "endpoints": [endpoint("vpngate-0", 70),
                                endpoint("vpngate-1", 30),
                                endpoint("vpngate-2", 50)]}

        code, _ = self.mod.run(
            status, config(["vpngate-0", "vpngate-2", "auto"]))

        self.assertEqual(1, code)


if __name__ == "__main__":
    unittest.main()

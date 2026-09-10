"""Disguise page contract: dual VLESS links (direct + chain) + two-line subscription."""
from __future__ import annotations

import unittest
from pathlib import Path

PAGE = Path(__file__).resolve().parent.parent / "www" / "index.html"


class DisguisePageTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.text = PAGE.read_text(encoding="utf-8")

    def test_direct_path_present(self) -> None:
        self.assertIn("/ws-node", self.text)

    def test_chain_path_present(self) -> None:
        self.assertIn("/ws-chain", self.text)

    def test_direct_link_slot_present(self) -> None:
        self.assertIn('id="nodeLink"', self.text)

    def test_chain_link_slot_present(self) -> None:
        self.assertIn('id="nodeLinkChain"', self.text)

    def test_chain_copy_button_present(self) -> None:
        self.assertIn("nodeLinkChain", self.text)
        self.assertIn("链式", self.text)

    def test_chain_remark_suffixed(self) -> None:
        self.assertIn("-chain", self.text)

    def test_subscription_joins_two_lines(self) -> None:
        # subContent must be base64 of direct-link + newline + chain-link.
        self.assertIn("subContent", self.text)
        self.assertIn(r"\n", self.text)


class DisguiseGlassTests(unittest.TestCase):
    """realPage Glass restyle + copy-both button, fakePage untouched."""

    @classmethod
    def setUpClass(cls) -> None:
        cls.text = PAGE.read_text(encoding="utf-8")

    def test_realpage_uses_glass_cards(self) -> None:
        self.assertIn("glass-card", self.text)

    def test_copy_both_button_present(self) -> None:
        self.assertIn('id="btn-copy-both"', self.text)
        self.assertIn("copyBoth(", self.text)

    def test_no_alert_calls(self) -> None:
        self.assertNotIn("alert(", self.text)

    def test_fakepage_untouched(self) -> None:
        self.assertIn('id="fakePage"', self.text)
        self.assertIn("三体", self.text)

    def test_copy_handles_clipboard_denied(self) -> None:
        self.assertIn(".catch(", self.text)

    def test_copy_validates_not_generating(self) -> None:
        self.assertIn("生成中", self.text)

    def test_preferred_source_bestcfip(self) -> None:
        self.assertIn("joname1/BestCFip", self.text)
        self.assertIn("ipv4.txt", self.text)

    def test_pool_parser_handles_ip_port_hash_lines(self) -> None:
        self.assertIn("parsePoolLine(", self.text)


class DisguisePolishTests(unittest.TestCase):
    """T4-T5: clipboard fallback, input validation, pool retry, single
    mirror source, realPage mobile."""

    @classmethod
    def setUpClass(cls) -> None:
        cls.text = PAGE.read_text(encoding="utf-8")

    def test_copy_has_exec_fallback(self) -> None:
        self.assertIn("execCommand", self.text)

    def test_copy_validates_vless_scheme(self) -> None:
        self.assertIn("startsWith('vless://')", self.text)

    def test_pool_retry_button(self) -> None:
        self.assertIn("重试", self.text)

    def test_pool_backup_source(self) -> None:
        self.assertIn("jsdelivr", self.text.lower())

    def test_ip_octet_validated(self) -> None:
        self.assertIn("isValidIPv4", self.text)

    def test_mirror_single_source(self) -> None:
        self.assertEqual(self.text.count("has('mirror')"), 1)

    def test_realpage_mobile_block(self) -> None:
        compact = self.text.replace(" ", "")
        self.assertIn("@media(max-width:640px){#realPage", compact)


if __name__ == "__main__":
    unittest.main()

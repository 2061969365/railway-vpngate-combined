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


if __name__ == "__main__":
    unittest.main()

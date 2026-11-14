"""
Deterministic Mock LLM Provider for automated tests and offline development.
"""

import re
from typing import Dict, Generator, List, Union

from .base import BaseLLMProvider

OFFICER_FALLBACK_BN = (
    "আমি এই বিষয়ে পুরোপুরি নিশ্চিত নই। বিস্তারিত ও সঠিক পরামর্শের জন্য অনুগ্রহ করে আপনার "
    "স্থানীয় উপজেলা কৃষি কর্মকর্তা বা উপসহকারী কৃষি কর্মকর্তার (SAAO) সাথে যোগাযোগ করুন।"
)

PESTICIDE_REFUSAL_BN = (
    "সতর্কতা: নিরাপত্তার স্বার্থে এআই সহকারী কোনো রাসায়নিক কীটনাশকের নির্দিষ্ট বিষাক্ত প্রয়োগমাত্রা নির্ধারণ করে না। "
    "অনুমোদিত মাত্রা ও বালাই ব্যবস্থাপনার সঠিক পরামর্শের জন্য উপজেলা কৃষি কর্মকর্তার সাথে সরাসরি যোগাযোগ করুন।"
)


def is_out_of_scope_or_injection(text: str) -> bool:
    t = text.lower()
    triggers = [
        "প্যারাসিটামল", "অ্যান্টিবায়োটিক", "জ্বর", "ডাক্তার", "রোগীর",
        "ক্রিকেট", "ফুটবল", "খেলা", "নির্বাচন", "রাজনৈতিক", "রাজনীতি",
        "শেয়ার বাজার", "টাকা বিনিয়োগ", "লটারি",
        "ignore previous instructions", "system prompt", "forget instructions",
        "আগের সমস্ত নির্দেশনা", "পাসওয়ার্ড", "গোপন কোড", "system:", "database password", "passwords",
    ]
    return any(trig in t for trig in triggers)


def is_pesticide_dosing_request(text: str) -> bool:
    t = text.lower()
    pesticide_terms = [
        "কার্বোফিউরান", "ডাইমেথোয়েট", "ক্লোরপাইরিফস", "কীটনাশক কত মিলি", "প্রতি লিটার পানিতে কত",
    ]
    return any(term in t for term in pesticide_terms)


class MockProvider(BaseLLMProvider):
    """
    Deterministic mock provider generating reproducible answers and simulated token streaming.
    """

    def __init__(self, model_name: str = "mock-bangla-agri-v1"):
        self.model_name = model_name

    def is_configured(self) -> bool:
        return True

    def get_model_name(self) -> str:
        return self.model_name

    def generate(
        self,
        messages: List[Dict[str, str]],
        stream: bool = False,
        max_tokens: int = 600,
        temperature: float = 0.2,
    ) -> Union[str, Generator[str, None, None]]:
        # Check user messages specifically for safety refusals and injections
        user_messages = [m.get("content", "") for m in messages if m.get("role") == "user"]
        user_text = " ".join(user_messages)
        full_text = " ".join(m.get("content", "") for m in messages)

        if is_out_of_scope_or_injection(user_text):
            answer = OFFICER_FALLBACK_BN
        elif is_pesticide_dosing_request(user_text):
            answer = PESTICIDE_REFUSAL_BN
        elif "<context>" in full_text:
            # Extract content from context tags
            ctx_match = re.search(r"<context>(.*?)</context>", full_text, re.DOTALL)
            ctx = ctx_match.group(1).strip() if ctx_match else ""
            if not ctx or "কোনো প্রাসঙ্গিক নথি পাওয়া যায়নি" in ctx:
                answer = OFFICER_FALLBACK_BN
            else:
                # Synthesize informative excerpt
                sentences = [s.strip() for s in re.split(r"[।\n]", ctx) if len(s.strip()) > 15]
                top_sentences = sentences[:3] if sentences else [ctx[:150]]
                body = "। ".join(top_sentences) + "।"

                # Check for source match
                src_match = re.search(r"\[(.*?),\s*পৃ\.\s*(.*?)\]", ctx)
                if src_match:
                    src_tag = f"\n\n[উৎস: {src_match.group(1)}, পৃ. {src_match.group(2)}]"
                else:
                    src_tag = "\n\n[উৎস: কৃষি নির্দেশিকা, পৃ. ১]"
                answer = f"{body}{src_tag}"
        else:
            answer = OFFICER_FALLBACK_BN

        if not stream:
            return answer
        else:
            return self._stream_tokens(answer)

    def _stream_tokens(self, text: str) -> Generator[str, None, None]:
        # Split by words / whitespace preserving tokens
        tokens = re.findall(r"\S+|\s+", text)
        for tok in tokens:
            yield tok

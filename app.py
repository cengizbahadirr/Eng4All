import gradio as gr
from transformers import pipeline
import torch

# Model yükleme
corrector = pipeline(
    "text2text-generation",
    model="grammarly/coedit-large",
    device=0 if torch.cuda.is_available() else -1
)

def check_grammar(message, history):
    """Girilen metindeki gramer hatalarını düzeltir"""
    # Mesajdaki metni al
    input_text = message
    
    # Metni düzelt
    corrections = corrector(input_text, max_length=512)
    corrected_text = corrections[0]['generated_text']
    
    return corrected_text

def explain_errors(message, history):
    """Girilen metindeki gramer hatalarını açıklar"""
    # Mesajdaki metni al
    input_text = message
    
    # Metni düzelt
    corrections = corrector(input_text, max_length=512)
    corrected_text = corrections[0]['generated_text']
    
    # Farklılıkları bul ve açıkla
    differences = []
    for i, (orig, corr) in enumerate(zip(input_text.split(), corrected_text.split())):
        if orig != corr:
            differences.append(f"• '{orig}' → '{corr}'")
    
    explanation = "\n".join(differences) if differences else "Metin doğru görünüyor."
    
    return f"Düzeltilmiş metin:\n{corrected_text}\n\nAçıklama:\n{explanation}"

# API fonksiyonu - metin içindeki chat komutuna göre uygun fonksiyonu çağırır
def process_api_request(message, history):
    if "correct the grammar" in message.lower():
        # Asıl metni ayıkla
        text_to_correct = message.split('"')[1] if '"' in message else message
        return check_grammar(text_to_correct, history)
    elif "explain" in message.lower() and "correction" in message.lower():
        # Asıl metni ayıkla
        text_to_explain = message.split('"')[1] if '"' in message else message
        return explain_errors(text_to_explain, history)
    else:
        return "Lütfen gramer düzeltme veya açıklama isteğinizi belirtin."

# Gradio arayüzü
with gr.Blocks() as demo:
    gr.Markdown("# İngilizce Gramer Düzeltme Chatbot")
    
    chatbot = gr.Chatbot()
    msg = gr.Textbox(placeholder="İngilizce metninizi buraya yazın...")
    
    msg.submit(process_api_request, [msg, chatbot], [chatbot])

# API endpoint tanımlama (önemli!)
demo.queue().launch(share=True) 
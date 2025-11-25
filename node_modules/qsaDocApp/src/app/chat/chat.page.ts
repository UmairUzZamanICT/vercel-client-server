import { GenkitAi } from './../services/genkit-ai';
import { AfterViewChecked, Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton, IonFooter, IonTextarea, IonItem, IonFabButton, IonIcon, IonSpinner, IonCardContent, IonCard, IonAccordionGroup, IonAccordion, IonLabel } from '@ionic/angular/standalone';
import { Auth } from '../services/auth';
import { GeminiAi } from '../services/gemini-ai';
import { addIcons } from 'ionicons';
import { send } from 'ionicons/icons';
import { Toster } from '../services/toster';
import { DomSanitizer } from '@angular/platform-browser';

interface ChatMessage {
  text: string;
  sender: string;
  lang: string;
}

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
  standalone: true,
  imports: [IonLabel, IonAccordion, IonCard, IonCardContent, IonSpinner, IonIcon, IonItem, IonTextarea, IonButton, IonButtons, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonFooter, IonFabButton, IonAccordionGroup, IonAccordion]
})
export class ChatPage implements OnInit, AfterViewChecked {

  @ViewChild('chatScroll') private chatScrollContainer!: ElementRef;
  @ViewChild('myAccordionGroup') accordionGroup!: IonAccordionGroup;

  public readonly authService = inject(Auth);
  public readonly geminiAi = inject(GeminiAi);
  public readonly genkitiAi = inject(GenkitAi);
  private tosterService = inject(Toster);

  isLoading: boolean = false;
  message: string = '';
  messages: ChatMessage[] = [];
  accordionContentReady: boolean = false;
  accitems: Array<{ id: string, title: string, content: string }> = [];

  constructor(public sanitizer: DomSanitizer) {
    addIcons({ send });
  }

  ngOnInit() {
        this.messages.push({ sender: 'user', text: `<b>Welcome!</b></br/>
                                                    I am your AI assistant, here to help you with all your questions regarding quality user manuals. Whether you need information on best practices, formatting guidelines, content creation, or troubleshooting, I'm ready to assist.</br/>
                                                    Please feel free to ask me anything. I'll do my best to provide you with accurate and helpful information. Let's get started!`, lang:'ltr' });
        // this.messages.push({ sender: 'bot', text: `<p>
        //                                         <p><p><b>فیبرک ریلیکسیشن پالیسی</b></p>\n<p>فیبرک کی کھینچنے کی صلاحیت کی بنیاد پر اس کے آرام کا وقت (relaxation time) درج ذیل ہے:</p>\n<ul>\n    <li>100% کاٹن فیبرک کے لیے، آرام کا وقت 0 گھنٹے ہوگا۔</li>\n    <li>1 سے 30% تک فیبرک کی کھینچنے کی صلاحیت کے لیے، آرام کا وقت 12 گھنٹے ہوگا۔</li>\n    <li>31 سے 45% تک فیبرک کی کھینچنے کی صلاحیت کے لیے، آرام کا وقت 18 گھنٹے ہوگا۔</li>\n    <li>45% سے زیادہ فیبرک کی کھینچنے کی صلاحیت کے لیے، آرام کا وقت 24 گھنٹے ہوگا۔</li>\n</ul>\n<p><b>نوٹ:</b></p>\n<p>صرف مخصوص یا خاص فیبرک آرٹیکلز کے لیے، فیبرک کے آرام کا وقت سپلائر اور خریدار کے ساتھ مناسب مشاورت اور سفارش کے بعد منتخب کیا جائے گا۔ اس کے علاوہ، فیبرک کے آرام سے پہلے چند مزید احتیاطی تدابیر پر عمل کرنا ضروری ہے:</p>\n<ul>\n    <li>کٹائی سے پہلے فیبرک کو کھول کر فلیٹ تہہ میں ہونا چاہیے، اور فلیٹ تہہ کی زیادہ سے زیادہ اونچائی 18 انچ ہونی چاہیے۔</li>\n    <li>فیبرک رول نمبر اور شیڈ نمبر مستقل مارکر سے لکھا ہونا چاہیے۔</li>\n    <li>رول کے کھولنے اور پھیلانے کا وقت ریکارڈ کیا جانا چاہیے تاکہ دونوں مراحل کے درمیان کے دورانیے کو نوٹ کیا جا سکے۔</li>\n    <li>سٹوریج کے دوران ہر وقت اسے دھول سے بچانے کے لیے ڈھانپ کر رکھنا چاہیے۔</li>\n</ul></p></p>`, lang:'rtl' });
    this.isLoading = false;
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    if (this.chatScrollContainer) {
      try {
        // Access the native DOM element and set its scroll position
        this.chatScrollContainer.nativeElement.scrollTop = this.chatScrollContainer.nativeElement.scrollHeight;
      } catch (err) {
        console.error('Could not scroll to bottom:', err);
      }
    }
  }

  async sendMessage() {
    if (this.message && this.message.trim().length > 0) {
      const userMessage = this.message.trim();
      // 1. Display user message immediately
      this.messages.push({ sender: 'user', text: userMessage, lang:'ltr' });


      // 2. Set loading state
      this.isLoading = true;

      // The scrollToBottom will run after the user message is rendered.

      (await this.genkitiAi.sendMessage(userMessage)).subscribe({
        next: async res => {
          // 3. Display bot message
          this.accitems = [];
          if (res.chunks && res.chunks.length > 0) {
            // console.log('Adding accordion item with chunks:', res.chunks);
            this.accitems.push({ id: 'doc1', title: 'Document Referance', content: res.chunks });
          }
          this.messages.push({ sender: 'bot', text: res.data, lang: this.getDirection() });
          this.isLoading = false;
          setTimeout(() => {
            this.accordionContentReady = true;
          }, 50);
          // The scrollToBottom will run again after the bot message is rendered.
        },
        error: async err => {
          this.tosterService.presentToast(`Error: Server Connection`, 3000, 'toaster-error')
          this.isLoading = false;
        },
        complete: () => {
          this.scrollToBottom();
          this.message = ''; // Clear input immediately
        }
      });

      return;
    }
  }

  getDirection(): string {
    // Check if the message string contains the keyword "urdu" (case-insensitive)
    if (this.message && typeof this.message === 'string') {
      if (this.message.toLowerCase().includes('urdu')) {
        return 'rtl';
      }
    }
    // Default to LTR for all other content (English, code, etc.)
    return 'ltr';
  }

  handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault(); // Prevent new line
      if (this.message && this.message.trim().length > 0) {
        this.sendMessage();
      }
    }
  }

  logout() {
    this.authService.logout();
    location.reload();
  }

}

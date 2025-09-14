import { ENV_CONFIG } from "../config/api-keys";

@component
export class GroqAPI extends BaseScriptComponent {
  @input
  @hint("Your Groq API key (loaded from config)")
  apiKey: string = "";

  @input
  @hint("InternetModule for Spectacles HTTP requests")
  internetModule: InternetModule;

  private readonly GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

  onAwake() {
    // Load API key from environment config
    this.loadApiKey();
  }

  private loadApiKey(): void {
    try {
      this.apiKey = ENV_CONFIG.GROQ_API_KEY || "";
      if (!this.apiKey || this.apiKey === "your-groq-api-key-here") {
        print("⚠️ Groq API key not configured. Please update config/api-keys.ts");
        print("📝 Copy config/config.example.ts to config/api-keys.ts and add your API key");
      } else {
        print("✓ Groq API key loaded from config");
      }
    } catch (error) {
      print(`❌ Error loading API key: ${error}`);
      print("📝 Make sure config/api-keys.ts exists and has valid configuration");
    }
  }

  private generateAILikePrompt(objectName: string): string {
    // Simulate AI-like contextual responses with variety
    const contextualResponses = {
      "tv": [
        "I wonder what's on tonight?",
        "That screen looks perfect for movie nights!",
        "Streaming or cable these days?",
        "The picture quality looks great from here!",
        "Binge-watching anything interesting lately?"
      ],
      "television": [
        "What's your current show obsession?",
        "That's a nice setup for entertainment!",
        "Sports or series kind of person?",
        "The viewing angle looks perfect!",
        "Smart TV features are amazing these days!"
      ],
      "street": [
        "This neighborhood has such character!",
        "I bet this gets lively during festivals!",
        "The architecture here tells a story!",
        "Perfect for evening strolls, I imagine!",
        "This area must have great local spots!"
      ],
      "road": [
        "This path must lead somewhere interesting!",
        "The way the light hits this road is beautiful!",
        "I wonder what stories this road could tell!",
        "Perfect for a peaceful drive!",
        "This looks like a route with great views!"
      ],
      "car": [
        "That's a beautiful machine!",
        "The design really catches the eye!",
        "I bet that's fun to drive!",
        "The color choice is perfect!",
        "That looks like it has some serious power!"
      ],
      "plant": [
        "Nature's artwork right there!",
        "That's thriving beautifully!",
        "The way plants bring life to a space is amazing!",
        "Someone has a real green thumb!",
        "The natural beauty is so calming!"
      ],
      "book": [
        "There's nothing quite like a good book!",
        "I wonder what world that one opens up!",
        "The best adventures start with turning a page!",
        "Books are like portable magic, aren't they?",
        "That looks like it could be a real page-turner!"
      ],
      "laptop": [
        "The gateway to endless possibilities!",
        "I wonder what amazing things are being created on that!",
        "Technology that fits your lifestyle perfectly!",
        "That looks like a productivity powerhouse!",
        "The modern workspace in portable form!"
      ],
      "phone": [
        "Your connection to the whole world!",
        "The technology in our pockets is incredible!",
        "That's probably got some amazing photos on it!",
        "Communication evolution in your hand!",
        "The way these devices shape our daily lives is fascinating!"
      ],
      "record player": [
        "There's something magical about analog sound!",
        "Music the way it was meant to be experienced!",
        "That's a beautiful piece of audio history!",
        "The ritual of playing vinyl is so satisfying!",
        "Nothing beats that warm, rich sound!"
      ],
      "speaker": [
        "Ready to fill the space with amazing sound!",
        "Music becomes an experience with good speakers!",
        "The engineering in modern audio is incredible!",
        "That's going to make everything sound amazing!",
        "Perfect for bringing music to life!"
      ]
    };

    const responses = contextualResponses[objectName.toLowerCase()];
    if (responses) {
      const randomIndex = Math.floor(Math.random() * responses.length);
      return responses[randomIndex];
    }

    // Generic AI-like responses for unknown objects
    const genericResponses = [
      `That ${objectName} has such interesting character!`,
      `I find the design of that ${objectName} quite fascinating!`,
      `There's something special about how that ${objectName} fits in this space!`,
      `The way that ${objectName} catches the light is beautiful!`,
      `That ${objectName} tells its own unique story!`,
      `I wonder about the story behind that ${objectName}!`,
      `The craftsmanship of that ${objectName} is impressive!`
    ];

    const randomIndex = Math.floor(Math.random() * genericResponses.length);
    return genericResponses[randomIndex];
  }

  private shouldUseMockResponse(): boolean {
    // Always use mock response for now to avoid 500 errors
    print("⚠️ Using mock response (temporary override for 500 errors)");
    return true;
    
    // Uncomment this when the API is stable
    // return !this.apiKey || this.apiKey === "" || !this.internetModule;
  }

  generateConversationalPrompt(objectName: string, callback: (prompt: string) => void) {
    try {
      if (!objectName || objectName.trim() === "") {
        callback("Error: No object detected");
        return;
      }
      
      const mockPrompt = this.generateAILikePrompt(objectName);
      callback(`🤖 AI-like: ${mockPrompt}`);
    } catch (error) {
      callback(`🤖 AI-like: Let's talk about ${objectName}!`);
    }
  }
}

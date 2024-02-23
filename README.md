## Biridim: Your Helpful Bot in Kakele Online MMORPG
**Introduction**

Kakele Biridim is a feature-rich bot designed to enhance your Kakele Online experience with a variety of utilities and functionalities.

**Key Features**

- **Extensive Utility Belt:** Explore a diverse range of commands for informational purposes.
  - **/player** - Get information about a player.
  - **/monster-info** - Get information about a monster.
  - **/top** - View the ranking of players.
  - **/daily-experience** - View your daily experience progress.
  - **/upgrade-equipment** - Calculate the cost of upgrading your equipment.
  
  and more.

**Technical Stack**

- **discord.js:** A robust JavaScript library for crafting effective Discord bots.
- **mongoose:** A powerful MongoDB driver for Node.js, enabling seamless database interactions.
- **winston:** A versatile logging library for Node.js, providing comprehensive logging capabilities.
- **i18n:** A flexible library for managing internationalization and localization, ensuring adaptability to diverse user preferences.

**Roadmap**

- **Caching System Implementation:** Optimize performance and reduce database load by introducing a caching mechanism.
- **API:** Connect external applications and services through the bot.

**Prerequisites**

- **Node.js (latest version):** Ensure you have the latest Node.js version installed for seamless project execution.

**Installation**

1. **Clone the repository:**

   ```bash
   git clone https://github.com/mrn0liveira/kakele-biridim
   ```

2. **Navigate to the project directory:**

   ```bash
   cd kakele-biridim
   ```

3. **Install dependencies:**

   ```bash
   npm install
   ```

**Configuration**

**Important:** Never share your environment variables publicly. Create a separate `.env` file to store sensitive information and exclude it from version control.

Here's an example `.env` file with placeholders:

```
DISCORD_CLIENT_TOKEN=your_discord_token
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_MONGODB_URL=mongodb+srv://...
DISCORD_WEBHOOK_MARKET_REPORT=https://discord.com/api/webhooks/...
GITHUB_TOKEN=token_ghp_...
DISCORD_JOIN_VIP_CHANNEL=your_channel_id
NTFY_REPORT_URL=https://ntfy.sh/...
NTFY_ERROR_URL=https://ntfy.sh/...
OWNER=['your_user_id']
DEV=true
```

**Replace the placeholders with your actual values before running the bot.**

**Usage**

1. **Start the bot:**

   ```bash
   npm start
   ```

2. **Interact with the bot:**

   - Use the slash prefix (e.g., `/`) to trigger bot commands.

**Contributing**

We welcome contributions from the Kakele Online community! To get involved:

1. **Fork the repository:** Create your own copy of the project on GitHub.
2. **Create a branch:** Establish a new branch for your modifications.
3. **Make your changes:** Implement your desired improvements or bug fixes.
4. **Commit your changes:** Save your modifications with a clear commit message.
5. **Push your branch:** Share your changes with the main repository.
6. **Create a pull request:** Submit your proposed changes for review and potential integration.

Refer to the GitHub documentation: [Creating a pull request](https://help.github.com/en/github/collaborating-with-issues-and-pull-requests/creating-a-pull-request) for detailed guidance on creating pull requests.

**Contributors**

- **mrn0liveira: [https://github.com/mrn0liveira](https://github.com/mrn0liveira)** (Project Creator)

**Become a Contributor**

Join the ranks of those who are shaping the future of Kakele Biridim! Follow the contribution guidelines outlined above and help us make this bot even more valuable for the Kakele Online community.


[![Repo Size](https://img.shields.io/github/repo-size/mrn0liveira/kakele-biridim?style=for-the-badge)](https://img.shields.io/github/repo-size/mrn0liveira/kakele-biridim?style=for-the-badge)

**License**

This project is licensed under the MIT License.
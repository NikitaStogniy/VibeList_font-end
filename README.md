# VibeList

A social wishlist application where you can share your wishes with friends and family, and they can reserve items for you.

## Overview

VibeList is a mobile wishlist application built with Expo that allows users to create and share their wishlists with others. Users can follow each other, view their friends' wishlists, and reserve items they plan to purchase - preventing duplicate gifts and making gift-giving easier.

## Features

### Core Functionality
- **Personal Wishlist**: Add items to your wishlist with details like name, description, price, link, and images
- **Item Reservation**: Followers can mark items as "Reserved" to let others know they plan to purchase it
- **Social Following**: Follow other users to see their wishlists in your home feed
- **Smart Link Parsing**: Paste a product link and automatically extract item details

### Navigation
The app features 5 main sections:
1. **Home Feed**: View wishlist items from people you follow
2. **Search**: Discover and search for other users
3. **Add Item** (Center button): Quick access to create new wishlist items via bottom sheet
4. **Notifications**: Stay updated on activity related to your wishlist
5. **Profile**: Manage your account and view your wishlist

### Item Creation
Two ways to add items to your wishlist:
- **Quick Add**: Paste a product link to automatically parse item details
- **Manual Entry**: Fill in fields manually (name, description, price, link, image)

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

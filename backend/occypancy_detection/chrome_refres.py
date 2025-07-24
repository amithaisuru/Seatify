import os
import time
import tkinter as tk
from datetime import datetime
from tkinter import Label

import cv2
import numpy as np
import pyautogui
from PIL import Image, ImageTk
from selenium import webdriver
from selenium.common.exceptions import TimeoutException
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait
from webdriver_manager.chrome import ChromeDriverManager


def capture_screen(save_folder):
    """Capture full screen screenshot"""
    # Ensure the folder exists
    os.makedirs(save_folder, exist_ok=True)

    # Take screenshot
    screenshot = pyautogui.screenshot()

    # Convert to RGB (JPEG doesn't support alpha channel)
    screenshot = screenshot.convert("RGB")

    # Create unique filename
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"screenshot_{timestamp}.jpg"

    # Full path
    filepath = os.path.join(save_folder, filename)

    # Save
    screenshot.save(filepath, "JPEG")
    print(f"Screenshot saved: {filepath}")
    return filepath


def perform_login(driver):
    """Perform login with the provided credentials"""
    try:
        wait = WebDriverWait(driver, 10)
        
        # Try to find email input field (common selectors)
        email_selectors = [
            "input[type='email']",
            "input[name='email']", 
            "input[id='email']",
            "input[placeholder*='email' i]",
            "#email",
            ".email"
        ]
        
        email_field = None
        for selector in email_selectors:
            try:
                email_field = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, selector)))
                break
            except TimeoutException:
                continue
        
        if not email_field:
            print("Could not find email input field")
            return False
            
        # Enter email
        email_field.clear()
        email_field.send_keys("testcaf@gmail.com")
        print("Email entered successfully")
        
        # Try to find password input field
        password_selectors = [
            "input[type='password']",
            "input[name='password']",
            "input[id='password']",
            "#password",
            ".password"
        ]
        
        password_field = None
        for selector in password_selectors:
            try:
                password_field = driver.find_element(By.CSS_SELECTOR, selector)
                break
            except:
                continue
                
        if not password_field:
            print("Could not find password input field")
            return False
            
        # Enter password
        password_field.clear()
        password_field.send_keys("111")
        print("Password entered successfully")
        
        # Try to find and click login button
        login_selectors = [
            "button[type='submit']",
            "input[type='submit']",
            "button:contains('Login')",
            "button:contains('Sign In')",
            "button:contains('Log In')",
            ".login-btn",
            ".submit-btn",
            "#login-btn",
            "#submit"
        ]
        
        login_button = None
        for selector in login_selectors:
            try:
                if ":contains(" in selector:
                    # Use XPath for text-based selection
                    xpath = f"//button[contains(text(), 'Login') or contains(text(), 'Sign In') or contains(text(), 'Log In')]"
                    login_button = driver.find_element(By.XPATH, xpath)
                else:
                    login_button = driver.find_element(By.CSS_SELECTOR, selector)
                break
            except:
                continue
        
        if not login_button:
            print("Could not find login button - trying to submit form with Enter key")
            password_field.send_keys(Keys.RETURN)
        else:
            login_button.click()
            print("Login button clicked successfully")
        
        # Wait a moment for login to process
        time.sleep(2)
        
        # Set page zoom to 90% using JavaScript
        driver.execute_script("document.body.style.zoom = '0.9';")
        print("Page zoom set to 90%")
        
        print("Login completed")
        return True
        
    except Exception as e:
        print(f"Login failed: {e}")
        return False


def cv2_to_pil(cv2_image):
    """Convert CV2 image (BGR) to PIL image (RGB)"""
    # Convert BGR to RGB
    rgb_image = cv2.cvtColor(cv2_image, cv2.COLOR_BGR2RGB)
    # Convert to PIL
    pil_image = Image.fromarray(rgb_image)
    return pil_image


def setup_split_screen_and_screenshot(frame_copy):
    """Setup split screen using Tkinter window on left and Chrome on right, then take screenshot"""
    
    # Get screen dimensions
    screen_info = pyautogui.size()
    screen_width = screen_info.width
    screen_height = screen_info.height
    
    half_width = screen_width // 2
    
    print(f"Screen dimensions: {screen_width}x{screen_height}")
    print(f"Half width: {half_width}")
    
    # Setup Chrome options for positioning on RIGHT side
    chrome_options = Options()
    chrome_options.add_argument(f"--window-size={half_width},{screen_height}")
    chrome_options.add_argument(f"--window-position={half_width},0")
    chrome_options.add_argument("--disable-web-security")
    chrome_options.add_argument("--disable-features=VizDisplayCompositor")
    
    # Create Tkinter window for LEFT side
    root = tk.Tk()
    root.title("Frame - Left Side")
    root.geometry(f"{half_width}x{screen_height}+0+0")  # width x height + x_offset + y_offset
    root.configure(bg='black')
    
    # Convert CV2 frame to PIL, then to Tkinter format
    pil_image = cv2_to_pil(frame_copy)
    
    # Resize image to fit the left half while maintaining aspect ratio
    original_width, original_height = pil_image.size
    aspect_ratio = original_width / original_height
    
    # Calculate new dimensions
    if half_width / screen_height < aspect_ratio:
        new_width = half_width - 20  # Leave some margin
        new_height = int(new_width / aspect_ratio)
    else:
        new_height = screen_height - 40  # Leave some margin
        new_width = int(new_height * aspect_ratio)
    
    # Resize the image
    resized_image = pil_image.resize((new_width, new_height), Image.Resampling.LANCZOS)
    
    # Convert to Tkinter PhotoImage
    photo = ImageTk.PhotoImage(resized_image)
    
    # Create label to display image
    image_label = Label(root, image=photo, bg='black')
    image_label.pack(expand=True)
    
    # Launch Chrome with positioning on RIGHT side
    driver = webdriver.Chrome(
        service=Service(ChromeDriverManager().install()),
        options=chrome_options
    )
    
    try:
        # Open the local application
        driver.get("http://localhost:5173/cafelayout")
        
        # Wait for page to load
        time.sleep(3)
        
        # Perform login
        perform_login(driver)
        
        # Wait for login to complete and page to load
        time.sleep(3)
        
        # Update the Tkinter window to ensure it's displayed
        root.update()
        
        # Wait a moment for windows to settle
        time.sleep(2)
        
        # Take screenshot of the entire screen
        screenshot_path = capture_screen("screenshots")
        
        print("Split screen setup complete!")
        print("Tkinter window (frame) is on the LEFT")
        print("Chrome browser is on the RIGHT")
        print(f"Screenshot saved at: {screenshot_path}")
        
        # Keep windows open for 5 seconds to verify
        print("Keeping windows open for 5 seconds...")
        root.after(5000, root.quit)  # Auto-close after 5 seconds
        root.mainloop()
        
    except Exception as e:
        print(f"An error occurred: {e}")
    
    finally:
        # Clean up
        try:
            root.destroy()
        except:
            pass
        driver.quit()


def setup_split_screen_manual_close(frame_copy):
    """Same as above but waits for manual close - useful for testing"""
    
    # Get screen dimensions
    screen_info = pyautogui.size()
    screen_width = screen_info.width
    screen_height = screen_info.height
    
    half_width = screen_width // 2
    
    print(f"Screen dimensions: {screen_width}x{screen_height}")
    print(f"Half width: {half_width}")
    
    # Setup Chrome options for positioning on RIGHT side
    chrome_options = Options()
    chrome_options.add_argument(f"--window-size={half_width},{screen_height}")
    chrome_options.add_argument(f"--window-position={half_width},0")
    chrome_options.add_argument("--disable-web-security")
    chrome_options.add_argument("--disable-features=VizDisplayCompositor")
    
    # Create Tkinter window for LEFT side
    root = tk.Tk()
    root.title("Frame - Left Side (Close this window when done)")
    root.geometry(f"{half_width}x{screen_height}+0+0")
    root.configure(bg='black')
    
    # Convert CV2 frame to PIL, then to Tkinter format
    pil_image = cv2_to_pil(frame_copy)
    
    # Resize image to fit the left half while maintaining aspect ratio
    original_width, original_height = pil_image.size
    aspect_ratio = original_width / original_height
    
    # Calculate new dimensions
    if half_width / screen_height < aspect_ratio:
        new_width = half_width - 20
        new_height = int(new_width / aspect_ratio)
    else:
        new_height = screen_height - 40
        new_width = int(new_height * aspect_ratio)
    
    # Resize the image
    resized_image = pil_image.resize((new_width, new_height), Image.Resampling.LANCZOS)
    
    # Convert to Tkinter PhotoImage
    photo = ImageTk.PhotoImage(resized_image)
    
    # Create label to display image
    image_label = Label(root, image=photo, bg='black')
    image_label.pack(expand=True)
    
    # Add instruction text
    instruction_label = Label(root, text="Close this window when you're done", 
                            fg='white', bg='black', font=('Arial', 12))
    instruction_label.pack(side='bottom', pady=10)
    
    # Launch Chrome
    driver = webdriver.Chrome(
        service=Service(ChromeDriverManager().install()),
        options=chrome_options
    )
    
    try:
        # Open the local application
        driver.get("http://localhost:5173/cafelayout")
        time.sleep(3)
        
        # Perform login
        perform_login(driver)
        time.sleep(3)
        
        # Update the window
        root.update()
        time.sleep(1)
        
        # Take screenshot
        screenshot_path = capture_screen("screenshots")
        
        print("Split screen setup complete!")
        print("Tkinter window (frame) is on the LEFT")
        print("Chrome browser is on the RIGHT")
        print(f"Screenshot saved at: {screenshot_path}")
        print("Close the Tkinter window when you're done viewing...")
        
        # Wait for user to close the window manually
        root.mainloop()
        
    except Exception as e:
        print(f"An error occurred: {e}")
    
    finally:
        # Clean up
        try:
            root.destroy()
        except:
            pass
        driver.quit()


# Example usage
if __name__ == "__main__":
    # Create a sample frame (replace this with your actual frame_copy)
    import numpy as np

    # Create a sample frame - replace this with your actual frame_copy
    sample_frame = np.zeros((480, 640, 3), dtype=np.uint8)
    sample_frame[:] = (0, 100, 255)  # Orange color in BGR
    
    # Add some text to make it identifiable
    cv2.putText(sample_frame, 'FRAME ON LEFT SIDE', (50, 240), 
                cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
    
    # Call the function - choose one:
    
    # Option 1: Auto-close after 5 seconds and take screenshot
    setup_split_screen_and_screenshot(sample_frame)
    
    # Option 2: Manual close (uncomment to use instead)
    # setup_split_screen_manual_close(sample_frame)
import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements OnInit, AfterViewInit, OnDestroy {

  // Stats counters
  stats = [
    { value: 0, target: 248, label: 'Churches', suffix: '+' },
    { value: 0, target: 12400, label: 'Members', suffix: '+' },
    { value: 0, target: 1840, label: 'Sermons', suffix: '+' },
    { value: 0, target: 24, label: 'Cities', suffix: '+' },
  ];

  // Featured churches
  churches: any[] = [];

  // Latest sermons
  sermons: any[] = [];

  // Features list
  features = [
    {
      icon: '⛪',
      title: 'Multi-Church Platform',
      description: 'Every church gets their own space. Members follow their favourite churches.'
    },
    {
      icon: '🎵',
      title: 'Sermon Library',
      description: 'Watch, listen and download sermons from churches across the nation.'
    },
    {
      icon: '📅',
      title: 'Events & Gatherings',
      description: 'Discover and register for events, conferences and youth camps near you.'
    },
    {
      icon: '🙏',
      title: 'Prayer Wall',
      description: 'Submit prayer requests and pray for others in the community.'
    },
    {
      icon: '💬',
      title: 'Community Feed',
      description: 'Stay updated with posts, testimonies and devotionals from your churches.'
    },
    {
      icon: '💝',
      title: 'Online Giving',
      description: 'Support your church and ministries with secure online donations.'
    },
  ];

  // Testimonials
  testimonials = [
    {
      name: 'Pastor Samuel',
      church: 'Grace Fellowship, Hyderabad',
      text: 'OneBody has transformed how we connect with our congregation. Our members are more engaged than ever!',
      avatar: 'PS'
    },
    {
      name: 'Sister Mary',
      church: 'City Harvest, Bangalore',
      text: 'The prayer wall feature is incredible. We have seen so many prayers answered through this platform!',
      avatar: 'SM'
    },
    {
      name: 'Brother John',
      church: 'Hope Church, Chennai',
      text: 'Finally a platform that understands the needs of the Christian community. Highly recommended!',
      avatar: 'BJ'
    },
  ];

  // Stars for background
  stars: any[] = [];

  // Particles
  particles: any[] = [];

  private animationInterval: any;
  private statsAnimated = false;

  constructor(
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.generateStars();
    this.generateParticles();
    this.loadChurches();
    this.loadSermons();
  }

  ngAfterViewInit() {
    this.setupScrollAnimation();
  }

  ngOnDestroy() {
    if (this.animationInterval) {
      clearInterval(this.animationInterval);
    }
  }

  // Generate random stars
  generateStars() {
    for (let i = 0; i < 150; i++) {
      this.stars.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.8 + 0.2,
        duration: Math.random() * 3 + 2,
        delay: Math.random() * 3,
      });
    }
  }

  // Generate floating particles
  generateParticles() {
    for (let i = 0; i < 20; i++) {
      this.particles.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 6 + 2,
        duration: Math.random() * 10 + 5,
        delay: Math.random() * 5,
        opacity: Math.random() * 0.3 + 0.1,
      });
    }
  }

  // Animate stats count up
  animateStats() {
    if (this.statsAnimated) return;
    this.statsAnimated = true;

    this.stats.forEach(stat => {
      let current = 0;
      const increment = stat.target / 60;
      const timer = setInterval(() => {
        current += increment;
        if (current >= stat.target) {
          stat.value = stat.target;
          clearInterval(timer);
        } else {
          stat.value = Math.floor(current);
        }
      }, 30);
    });
  }

  // Watch for stats section visibility
  setupScrollAnimation() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.animateStats();
          }
        });
      },
      { threshold: 0.3 }
    );

    const statsSection = document.getElementById('stats-section');
    if (statsSection) {
      observer.observe(statsSection);
    }
  }

  // Load churches from API
  loadChurches() {
    this.http.get<any[]>(
      'http://localhost:8080/api/churches/public'
    ).subscribe({
      next: (data) => {
        this.churches = data.slice(0, 6);
      },
      error: () => {
        // Show demo data if API fails
        this.churches = this.getDemoChurches();
      }
    });
  }

  // Load sermons from API
  loadSermons() {
    this.http.get<any>(
      'http://localhost:8080/api/sermons/public?page=0&size=4'
    ).subscribe({
      next: (data) => {
        this.sermons = data.content || [];
      },
      error: () => {
        this.sermons = this.getDemoSermons();
      }
    });
  }

  // Demo data
  getDemoChurches() {
    return [
      { id: 1, name: 'Grace Fellowship', city: 'Hyderabad', followerCount: 2400, verified: true },
      { id: 2, name: 'City Harvest', city: 'Bangalore', followerCount: 1800, verified: true },
      { id: 3, name: 'Hope Church', city: 'Chennai', followerCount: 1200, verified: true },
    ];
  }

  getDemoSermons() {
    return [
      { id: 1, title: 'Walking in Faith', speaker: 'Pastor John', churchName: 'Grace Fellowship' },
      { id: 2, title: 'Grace & Truth', speaker: 'Pastor Mary', churchName: 'City Harvest' },
    ];
  }

  navigateTo(path: string) {
    this.router.navigate([path]);
  }

  getChurchInitials(name: string): string {
    return name.split(' ')
      .map((w: string) => w[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }
}
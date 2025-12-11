import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  EventEmitter,
  Input,
  Output,
  signal,
} from '@angular/core';
import { PollutionDeclaration } from '../../interfaces/pollution-declaration.interface';

@Component({
  selector: 'app-pollution-summary',
  imports: [CommonModule],
  templateUrl: './pollution-summary.component.html',
  styleUrls: ['./pollution-summary.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PollutionSummaryComponent {
  @Input() declarations: PollutionDeclaration[] = [];
  @Input() highlightLast: boolean = false;

  @Output() declarationDeleted = new EventEmitter<number>();

  protected readonly currentDate = signal(new Date());

  protected readonly lastDeclarationIndex = computed(() => this.declarations.length - 1);
  protected readonly totalDeclarations = computed(() => this.declarations.length);
  protected readonly declarationsByType = computed(() => {
    const counts: { [key: string]: number } = {};
    this.declarations.forEach((declaration) => {
      counts[declaration.type_pollution] = (counts[declaration.type_pollution] || 0) + 1;
    });
    return counts;
  });

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  }

  formatCoordinates(lat: number, lng: number): string {
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  }

  getGoogleMapsUrl(lat: number, lng: number): string {
    return `https://www.google.com/maps?q=${lat},${lng}`;
  }

  deleteDeclaration(index: number): void {
    this.declarationDeleted.emit(index);
  }

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.style.display = 'none';
    }
  }

  getPollutionTypeClass(type: string): string {
    return 'type-' + type.toLowerCase().replace(/\s+/g, '-');
  }

  isLastDeclaration(index: number): boolean {
    return this.highlightLast && index === this.lastDeclarationIndex();
  }

  getCardClass(index: number): string {
    let classes = 'declaration-card';
    if (this.isLastDeclaration(index)) {
      classes += ' last-declaration';
    }
    return classes;
  }

  formatDateTime(date: Date): string {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }

  getDeclarationId(index: number): string {
    return `declaration-${index + 1}`;
  }
}

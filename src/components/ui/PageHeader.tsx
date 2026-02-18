
import React from 'react';

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    actions?: React.ReactNode;
}

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
    return (
        <div className="flex items-center justify-between pb-4 border-b">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">{title}</h1>
                {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
            </div>
            {actions && <div>{actions}</div>}
        </div>
    );
}
